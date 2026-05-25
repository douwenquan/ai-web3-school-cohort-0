import { TxContext } from '../types';

interface RawDataPanelProps {
  context: TxContext;
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <details className="raw-block">
      <summary>{title}</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}

export default function RawDataPanel({ context }: RawDataPanelProps) {
  return (
    <div className="raw-data-panel">
      <h3>
        <span className="badge badge-data">📡 链上数据</span>
        原始链上数据
      </h3>
      <JsonBlock title="交易详情" data={context.txDetail} />
      <JsonBlock title={`事件日志 (${context.eventLogs.length})`} data={context.eventLogs} />
      {context.contractABI && (
        <JsonBlock
          title={`合约 ABI ${context.manualABI ? '(人工提供)' : '(Etherscan 获取)'}`}
          data={context.contractABI}
        />
      )}
      {!context.contractABI && (
        <div className="raw-block warning">
          未能获取合约 ABI（合约可能未验证），LLM 只能根据原始 calldata 推断。
        </div>
      )}
    </div>
  );
}
