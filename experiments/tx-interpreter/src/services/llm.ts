import OpenAI from 'openai';
import { Explanation, TxContext } from '../types';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/explain';

export interface ExplainResult {
  explanation: Explanation;
  rawOutput: string;
  parseErrors: string[];
}

export async function explainTransaction(
  context: TxContext,
  apiKey: string,
  baseUrl: string,
): Promise<ExplainResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl || 'https://api.deepseek.com',
    dangerouslyAllowBrowser: true,
  });

  const contextJson = JSON.stringify(context, null, 2);
  const userPrompt = buildUserPrompt(contextJson);

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek returned empty response.');
  }

  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse LLM response as JSON. Raw output:\n${content}`);
  }

  const parseErrors: string[] = [];

  const requiredFields: (keyof Explanation)[] = [
    'actionSummary',
    'assetsAndAddresses',
    'onChainData',
    'modelInference',
    'uncertainties',
    'securityChecklist',
  ];

  const explanation: Explanation = {
    actionSummary: '',
    assetsAndAddresses: '',
    onChainData: '',
    modelInference: '',
    uncertainties: '',
    securityChecklist: '',
  };

  for (const field of requiredFields) {
    if (typeof parsed[field] === 'string' && parsed[field].trim()) {
      explanation[field] = parsed[field] as string;
    } else {
      parseErrors.push(`Missing or empty field: ${field}`);
      explanation[field] = `（模型未生成此字段的内容）`;
    }
  }

  return { explanation, rawOutput: content, parseErrors };
}
