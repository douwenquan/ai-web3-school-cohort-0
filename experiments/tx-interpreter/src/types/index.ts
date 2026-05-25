export interface TxDetail {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  nonce: string;
  input: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex: string;
}

export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  decoded?: DecodedEvent | null;
}

export interface DecodedEvent {
  name: string;
  params: Record<string, unknown>;
}

export interface AbiItem {
  type: string;
  name?: string;
  inputs?: { name: string; type: string; indexed?: boolean }[];
  outputs?: { name: string; type: string }[];
  stateMutability?: string;
  anonymous?: boolean;
}

export interface TxContext {
  txHash: string;
  txDetail: TxDetail;
  eventLogs: EventLog[];
  contractABI: AbiItem[] | null;
  manualABI: boolean;
  decodedInput: { name: string; params: Record<string, unknown> } | null;
}

export interface Explanation {
  actionSummary: string;
  assetsAndAddresses: string;
  onChainData: string;
  modelInference: string;
  uncertainties: string;
  securityChecklist: string;
}
