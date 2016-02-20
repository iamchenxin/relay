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

const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryRoot', () => {
    var {getNode} = RelayTestUtils;

    var me;
    var usernames;

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
        usernames.getConcreteQueryNode().metadata = {
            isPlural: true,
            identifyingArgName: 'names',
        };
    });

    it('has a unique ID', () => {
        var lastID = getNode(Relay.QL`query{me{firstName}}`).getID();
        var nextID = getNode(Relay.QL`query{me{lastName}}`).getID();
        expect(lastID).toMatch(/^q\d+/);
        expect(nextID).toMatch(/^q\d+/);
        expect(nextID).not.toEqual(lastID);
    });
/*
    it('returns the identifying list-object argumentsssssss ', () => {
        var wayQuery = getNode(Relay.QL`
      query {
        fastestRoute(waypoints:[{uri:"s",dumbNumber:[1,7]},
          {uri:"a",dumbNumber:[88,666]}]){
          dumb,
        }
      }
    `);
        wayQuery.getConcreteQueryNode().metadata= {
            identifyingArgName: 'waypoints',
            identifyingArgType: '[Waypoint!]!' };
        const nodeIdentifyingArg = wayQuery.getIdentifyingArg();

        expect(nodeIdentifyingArg).toBeDefined();
        expect(nodeIdentifyingArg.type).toBe('[Waypoint!]!');
        expect(nodeIdentifyingArg).toEqual(
            {
                name: 'waypoints',
                value: [
                    { uri: 's', dumbNumber: [1, 7] },
                    { uri: 'a', dumbNumber: [88,666] },
                ],
                type: '[Waypoint!]!'
            }
        );
    });
    */
});