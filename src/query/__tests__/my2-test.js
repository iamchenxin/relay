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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .mock('warning');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');
var util = require('util');
function mylogA(msg,v){
  console.warn("    \n+++++++"+msg+"+++++++\n"+util.inspect(v,true,3,true)
    +"    \n++++\n");
}
function mylogB(v){
  console.warn(util.inspect(v,true,3,true));
}

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;
  var RelayRecordWriter;

  var {
    getNode,
    getRefNode,
    getVerbatimNode,
    writePayload,
    writeVerbatimPayload,
    } = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('root record', () => {


    it('uses existing id for custom root calls without an id sss', () => {
      const cachedRootCallMap = {
        'viewer': {'': 'client:12345'},
      };
      const cachedRecords = {
        'client:12345': {__dataID__: 'client:12345'},
      };
      const rootCallMap = {};
      const records = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const cachedStore = new RelayRecordStore(
        {records, cachedRecords},
        {cachedRootCallMap, rootCallMap}
      );

      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
            },
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: '123',
          },
        },
      };

      const results = writePayload(cachedStore, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {
          'client:12345': true,
        },
      });

      expect(store.getRecordState('client:12345')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:12345', 'actor')).toBe('123');
      expect(store.getDataID('viewer')).toBe('client:12345');
    });
  });
});
