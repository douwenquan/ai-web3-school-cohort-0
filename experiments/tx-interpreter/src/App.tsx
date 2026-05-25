import { useState, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import InputPanel from './components/InputPanel';
import RawDataPanel from './components/RawDataPanel';
import ExplanationPanel from './components/ExplanationPanel';
import { fetchTxData } from './services/etherscan';
import { explainTransaction } from './services/llm';
import { TxContext, Explanation } from './types';

const STORAGE_KEY = 'tx-interpreter-config';

interface Config {
  rpcUrl: string;
  etherscanKey: string;
  deepseekKey: string;
  deepseekBaseUrl: string;
}

function getConfig(): Config | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type Phase =
  | { type: 'idle' }
  | { type: 'fetching' }
  | { type: 'explaining'; context: TxContext }
  | { type: 'done'; context: TxContext; explanation: Explanation; parseErrors: string[]; rawOutput: string }
  | { type: 'error'; message: string; partialContext?: TxContext };

export default function App() {
  const [configured, setConfigured] = useState(!!getConfig());
  const [phase, setPhase] = useState<Phase>({ type: 'idle' });

  const handleAnalyze = useCallback(async (txHash: string, manualABI?: string) => {
    const config = getConfig();
    if (!config) {
      setPhase({ type: 'error', message: '请先配置 API Key。' });
      return;
    }

    setPhase({ type: 'fetching' });

    if (!config.rpcUrl) {
      setPhase({ type: 'error', message: 'RPC URL 未配置。请在「修改配置」中填入 RPC URL（如 https://eth-sepolia.g.alchemy.com/v2/xxx）' });
      return;
    }

    try {
      const { context } = await fetchTxData(txHash, config.rpcUrl, config.etherscanKey, manualABI);
      setPhase({ type: 'explaining', context });

      try {
        const result = await explainTransaction(
          context,
          config.deepseekKey,
          config.deepseekBaseUrl,
        );
        setPhase({
          type: 'done',
          context,
          explanation: result.explanation,
          parseErrors: result.parseErrors,
          rawOutput: result.rawOutput,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setPhase({ type: 'error', message: `LLM 调用失败: ${msg}`, partialContext: context });
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPhase({ type: 'error', message: msg });
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Transaction Interpreter</h1>
        <p>输入以太坊交易哈希，查看 AI 对交易的完整解析 — 动作、资产、推断与安全检查</p>
      </header>

      <ConfigPanel onConfigured={() => setConfigured(true)} />

      {configured && (
        <InputPanel onAnalyze={handleAnalyze} loading={phase.type === 'fetching' || phase.type === 'explaining'} />
      )}

      {phase.type === 'fetching' && (
        <div className="status-msg">正在从链上获取交易数据...</div>
      )}

      {(phase.type === 'explaining' || phase.type === 'done') && (
        <RawDataPanel context={phase.context} />
      )}

      {phase.type === 'explaining' && (
        <div className="status-msg">正在调用 DeepSeek 生成解释...</div>
      )}

      {phase.type === 'done' && (
        <>
          {phase.parseErrors.length > 0 && (
            <div className="error-msg" style={{ background: '#2d2018', borderColor: '#d2991d44', color: '#d2991d' }}>
              <strong>提示：</strong> 模型未生成以下字段的内容：
              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                {phase.parseErrors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            </div>
          )}
          <ExplanationPanel explanation={phase.explanation} />
          <details style={{ marginBottom: 20 }}>
            <summary style={{ cursor: 'pointer', color: '#8b949e', fontSize: 14 }}>
              查看模型原始输出
            </summary>
            <pre style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: 6, padding: 16, marginTop: 8,
              fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {phase.rawOutput}
            </pre>
          </details>
        </>
      )}

      {phase.type === 'error' && (
        <div className="error-msg">
          <strong>错误：</strong> {phase.message}
          {phase.partialContext && <RawDataPanel context={phase.partialContext} />}
        </div>
      )}
    </div>
  );
}
