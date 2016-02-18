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


const stringifyArg = require('RelayRecordUtil').stringifyArg;


const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const mylog = require('RelayRecordUtil').mylog;



describe('My test', () => {
  var {getNode} = RelayTestUtils;

  var me;
  var usernames;
  var usertemp;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);

    me = getNode(Relay.QL`
      query {
        me {
          name1: firstName,
          name1: lastName,
        }
      }
    `);

    usernames = getNode(Relay.QL`
      query {
        usernames(names:"mroch") {
          firstName,
        }
      }
    `);

    usertemp = getNode(Relay.QL`
      query {
        usertemp(tuple:{name:"tom",age:18}){
          firstName,
        }
      }
    `);


    usernames.getConcreteQueryNode().metadata = {
      isPlural: true,
      identifyingArgName: 'names',
    };
  });

  /*
  it('substitutes variable values', () => {
    var key = 'profilePicture{size:[0:"32",1:"64"]}';
    var pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:["32","64"])
        }
      `;
    var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
    expect(pictureScalar.getStorageKey()).toBe(key);

    var pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
    var variables = {
      height: '64',
      width: '32',
    };
    var pictureVariable =
      getNode(pictureVariableRQL, variables).getChildren()[0];
    expect(pictureVariable.getStorageKey()).toBe(key);
  });
  */

  it('returns root calls with values', () => {
    expect(me.getIdentifyingArg()).toEqual(undefined);

    expect(usernames.getIdentifyingArg()).toEqual(
      {name: 'names', value: 'mroch'}
    );
    mylog("usernames : \n",usernames.getIdentifyingArg());
    expect(getNode(Relay.QL`
      query {
        usernames(names:["a","b","c"]) {
          firstName
        }
      }
    `).getIdentifyingArg()).toEqual(
      {name: 'names', value: ['a', 'b', 'c']}
    );
  });


  it('returns root calls with Objesct values s', () => {
    expect(me.getIdentifyingArg()).toEqual(undefined);


    expect(usertemp.getIdentifyingArg()).toEqual(
      {name: 'tuple', value: {name:'tom',age:18},type: 'tupleUser!'}
    );

    expect(getNode(Relay.QL`
      query {
        usertemp(tuple:{name:"tom",age:18}){
          firstName,
        }
      }
    `).getIdentifyingArg()).toEqual(
      {name: 'tuple', value: {name:'tom',age:18},type: 'tupleUser!'}
    );
  });



  /*
    it('creates a wrapped fragment pointer with object arg', () => {
      var rootFragment = Relay.QL`fragment on Node{id}`;

      console.warn('~ssssssx~##~');
      var root = getNode(Relay.QL`query{
        usertemp(tuple:{name:"tom",age:18}){
          ${rootFragment}
        }
        }`);

     // console.warn(root);
      mylog("recordStore : ",recordStore);
      var result = RelayFragmentPointer.createForRoot(recordStore, root);
      var resultKeys = Object.keys(result);
      expect(resultKeys.length).toBe(1);

      var fragmentPointer = result[resultKeys[0]];
      expect(fragmentPointer.getDataID()).toBe(stringifyArg({name:'tom',age:18}));
      expect(fragmentPointer.getFragment()).toEqualQueryNode(
        getNode(rootFragment)
      );
    });
    */

/*
  it('returns the type', () => {

    var root = getNode(Relay.QL`query{
      usertemp(tuple:{name:"tom",age:18}){
        ${rootFragment}
      }
      }`);

    var actor = getNode(Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `).getChildren()[0];
    expect(actor.getType()).toBe('Actor');
  });
  */
});