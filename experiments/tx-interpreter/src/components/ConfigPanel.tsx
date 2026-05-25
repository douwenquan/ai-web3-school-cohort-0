import { useState, useEffect } from 'react';

interface Config {
  rpcUrl: string;
  etherscanKey: string;
  deepseekKey: string;
  deepseekBaseUrl: string;
}

interface ConfigPanelProps {
  onConfigured: () => void;
}

const STORAGE_KEY = 'tx-interpreter-config';

function loadConfig(): Config | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return null;
}

function saveConfig(config: Config): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function ConfigPanel({ onConfigured }: ConfigPanelProps) {
  const saved = loadConfig();
  const [rpcUrl, setRpcUrl] = useState(saved?.rpcUrl ?? '');
  const [etherscanKey, setEtherscanKey] = useState(saved?.etherscanKey ?? '');
  const [deepseekKey, setDeepseekKey] = useState(saved?.deepseekKey ?? '');
  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState(
    saved?.deepseekBaseUrl ?? 'https://api.deepseek.com',
  );
  const isValid = !!(saved?.rpcUrl);
  const [saved_, setSaved_] = useState(isValid);

  useEffect(() => {
    if (isValid) {
      onConfigured();
    }
  }, []);

  function handleSave() {
    if (!rpcUrl.trim() || !deepseekKey.trim()) return;
    saveConfig({
      rpcUrl: rpcUrl.trim(),
      etherscanKey: etherscanKey.trim(),
      deepseekKey: deepseekKey.trim(),
      deepseekBaseUrl: deepseekBaseUrl.trim() || 'https://api.deepseek.com',
    });
    setSaved_(true);
    onConfigured();
  }

  if (saved_) {
    return (
      <div className="config-panel config-panel--saved">
        <span>API 配置已就绪</span>
        <button onClick={() => setSaved_(false)}>修改</button>
      </div>
    );
  }

  return (
    <div className="config-panel">
      <h3>API 配置</h3>
      <div className="config-field">
        <label htmlFor="rpc-url">RPC URL（必填，如 Alchemy / Infura 节点）</label>
        <input
          id="rpc-url"
          type="text"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="https://eth-mainnet.g.alchemy.com/v2/xxx"
        />
      </div>
      <div className="config-field">
        <label htmlFor="deepseek-key">DeepSeek API Key</label>
        <input
          id="deepseek-key"
          type="password"
          value={deepseekKey}
          onChange={(e) => setDeepseekKey(e.target.value)}
          placeholder="sk-..."
        />
      </div>
      <div className="config-field">
        <label htmlFor="deepseek-url">DeepSeek Base URL</label>
        <input
          id="deepseek-url"
          type="text"
          value={deepseekBaseUrl}
          onChange={(e) => setDeepseekBaseUrl(e.target.value)}
          placeholder="https://api.deepseek.com"
        />
      </div>
      <div className="config-field">
        <label htmlFor="etherscan-key">Etherscan API Key（可选，用于自动获取 ABI，国内可能不通）</label>
        <input
          id="etherscan-key"
          type="password"
          value={etherscanKey}
          onChange={(e) => setEtherscanKey(e.target.value)}
          placeholder="不填则需要手动粘贴 ABI"
        />
      </div>
      <button onClick={handleSave}>保存配置</button>
    </div>
  );
}
