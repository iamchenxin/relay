/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayQueryPayload
 * @flow
 * @typechecks
 */

'use strict';

const RelayNodeInterface = require('RelayNodeInterface');
const RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
const RelayQueryPath = require('RelayQueryPath');
import type RelayQueryWriter from 'RelayQueryWriter';
import type {QueryPayload} from 'RelayInternalTypes';
var util = require('util');
function mylogA(msg,v){
  console.warn("    \n+++++++"+msg+"+++++++\n"+util.inspect(v,true,3,true)
    +"    \n++++\n");
}
function mylogB(v){
  console.warn(util.inspect(v,true,3,true));
}
/**
 * @internal
 *
 * Traverses a query and payload in parallel, writing the results into the
 * store.
 */
function writeRelayQueryPayload(
  writer: RelayQueryWriter,
  query: RelayQuery.Root,
  payload: QueryPayload
): void {
  const store = writer.getRecordStore();
  const recordWriter = writer.getRecordWriter();
  const path = new RelayQueryPath(query);
  var pb =RelayNodeInterface.getResultsFromPayload(store, query, payload);
 // mylogA("RelayNodeInterface.getResultsFromPayload ",pb);
    pb.forEach(({dataID, result, rootCallInfo}) => {
      if (rootCallInfo) {
     //   mylogA("pb.forEach recordWriter << dataID:"+dataID,writer);
        recordWriter.putDataID(
          rootCallInfo.storageKey,
          rootCallInfo.identifyingArgValue,
          dataID
        );
     //   mylogA("pb.forEach dataID:"+dataID,writer);
      }
      writer.writePayload(query, dataID, result, path);
    });

}

module.exports = RelayProfiler.instrument(
  'writeRelayQueryPayload',
  writeRelayQueryPayload
);
