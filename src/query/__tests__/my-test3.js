/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');
var util = require('util');
function mylogA(msg,v){
  console.warn("    \n+++++++"+msg+"+++++++\n"+util.inspect(v,true,3,true)
    +"    \n++++\n");
}
function mylogB(v){
  console.warn(util.inspect(v,true,5,false));
}

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMockCacheManager = require('RelayMockCacheManager');
const RelayMutationType = require('RelayMutationType');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('RelayStoreData', function() {
  var cacheManager;
  var storeData;

  var {getNode} = RelayTestUtils;
  var CLIENT_MUTATION_ID, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  function getPathToRecord(dataID) {
    return storeData.getRecordStore().getPathToRecord(dataID);
  }

  function getRangeForRecord(dataID) {
    var nodeData = storeData.getNodeData();
    expect(Object.keys(nodeData)).toContain(dataID);
    return nodeData[dataID].__range__;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({
      CLIENT_MUTATION_ID,
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO,
    } = RelayConnectionInterface);

    cacheManager = RelayMockCacheManager.genCacheManager();
    storeData = new RelayStoreData();
    storeData.injectCacheManager(cacheManager);

    jasmine.addMatchers({
      toContainCalledMethods: () => ({
        compare: (actual, calls) => {
          let message;
          const pass = Object.keys(calls).every(methodName => {
            const expected = calls[methodName];
            const value = actual[methodName].mock.calls.length;
            const pass = expected === value;

            const expTimes = expected + ' time' + (expected === 1 ? '' : 's');
            const actTimes = value + ' time' + (value === 1 ? '' : 's');
            const not = pass ? 'not ' : '';
            message = 'Expected `' + methodName + '` ' + not + 'to be called ' +
              expTimes + ', was called ' + actTimes + '.';
            return pass;
          });
          return {pass, message};
        },
      }),
      toBeCalledWithNodeFields: (util, customEqualityTesters) => ({
        compare: (actual, nodeFields) => {
          let message;
          const pass = Object.keys(nodeFields).every(
            expectedID => Object.keys(nodeFields[expectedID]).every(
              expectedFieldName => {
                message =
                  'Expected function to be called with (' +
                  expectedID + ', ' +
                  expectedFieldName + ', ' +
                  nodeFields[expectedID][expectedFieldName] + ').';
                return actual.mock.calls.some(
                  ([actualID, actualFieldName, actualFieldValue]) => (
                    actualID === expectedID &&
                    actualFieldName === expectedFieldName &&
                    util.equals(
                      actualFieldValue,
                      nodeFields[expectedID][actualFieldName],
                      customEqualityTesters
                    )
                  )
                );
              }
            )
          );
          return {pass, message};
        },
      }),
    });
  });


  it('caches custom root callsss', () => {
    var query = getNode(Relay.QL`query{username(name:"yuzhi"){id}}`);
    var response = {username: {id: '123'}};
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 2,
      writeRootCall: 1,
    });
    expect(queryWriter.writeRootCall).toBeCalledWith(
      'username',
      'yuzhi',
      '123'
    );
    mylogA("queryWriter.writeRootCall", queryWriter.writeRootCall);
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        id: '123',
      },
    });
  });
});