'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Form from './components/form';
import GenerateDialog from './components/GenerateDialog';
import ResponseDisplay from './components/ResponseDisplay';
import ToggleButton from './components/ToggleButton';

// 动态导入 FileUpload 组件
const FileUpload = dynamic(() => import('./components/FileUpload'), { ssr: false });

// 在文件顶部的 import 语句后添加
const ttsModelModes = [
  { value: 'api', label: 'API模式' },
  { value: 'local', label: '本地模式' }
];

const ttsApiModels = [
  { value: 'reecho', label: 'Reecho' }
];

const ttsLocalModels = [
  { value: 'coquitts', label: 'Coqui TTS' }
];

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('prompt');
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('一个主持人，一个嘉宾，一个专家');
  const [generatedText, setGeneratedText] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelMode, setModelMode] = useState('api');
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [ttsModelMode, setTtsModelMode] = useState('api');
  const [selectedTtsModel, setSelectedTtsModel] = useState('reecho');

  const options = [
    { value: 'prompt', label: '提示词生成播客音频' },
    { value: 'file', label: '根据文件生成播客音频' }
  ];

  const modelModes = [
    { value: 'api', label: 'API模式' },
    { value: 'local', label: '本地模式' }
  ];

  const apiModels = [
    { value: 'deepseek', label: 'Deepseek' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'yi', label: 'Yi' }
  ];

  const localModels = [
    { value: 'llama', label: 'LLaMA' },
    { value: 'qwen', label: 'Qwen' },
    { value: 'yi', label: 'Yi' }
  ];

  const handleConfirm = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/reecho/reecho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('文案已确认:', result);
      // 这里可以添加一些用户反馈，比如显示一个成功消息
    } catch (error) {
      console.error('确认文案时出错:', error);
      // 这里可以添加一些错误处理，比如显示一个错误消息
    } finally {
      setIsLoading(false);
    }
  };

  const getModelEndpoint = (model, isLocal) => {
    return isLocal ? `${model}_local` : model;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">AI 播客生成器</h1>
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          <div className="space-y-4">
            <div className="w-full">
              <label htmlFor="option-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择生成方式</label>
              <select
                id="option-select"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="select-box w-full"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="model-select-label">生成对话文本模式</span>
                <ToggleButton
                  options={modelModes}
                  selectedOption={modelMode}
                  onSelect={setModelMode}
                />
              </div>
              
              <div>
                <span className="model-select-label">选择模型</span>
                <ToggleButton
                  options={modelMode === 'api' ? apiModels : localModels}
                  selectedOption={selectedModel}
                  onSelect={setSelectedModel}
                />
              </div>
            </div>
          </div>
          
          <div className="content-container">
            {selectedOption === 'prompt' && (
              <>
                <Form 
                  topic={topic}
                  setTopic={setTopic}
                  format={format}
                  setFormat={setFormat}
                />
                <div className="mt-6">
                  <GenerateDialog 
                    topic={topic} 
                    format={format} 
                    setGeneratedText={setGeneratedText}
                    setIsLoading={setIsLoading}
                    model={getModelEndpoint(selectedModel, modelMode === 'local')}
                  />
                </div>
                <ResponseDisplay 
                  generatedText={generatedText}
                  isLoading={isLoading}
                  setGeneratedText={setGeneratedText}
                  ttsModelMode={ttsModelMode}
                  selectedTtsModel={selectedTtsModel}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="model-select-label">TTS 模式</span>
                    <ToggleButton
                      options={ttsModelModes}
                      selectedOption={ttsModelMode}
                      onSelect={(mode) => {
                        setTtsModelMode(mode);
                        setSelectedTtsModel(mode === 'api' ? 'reecho' : 'coquitts');
                      }}
                    />
                  </div>
                  
                  <div>
                    <span className="model-select-label">TTS 模型</span>
                    <ToggleButton
                      options={ttsModelMode === 'api' ? ttsApiModels : ttsLocalModels}
                      selectedOption={selectedTtsModel}
                      onSelect={setSelectedTtsModel}
                    />
                  </div>
                </div>
              </>
            )}
            
            {selectedOption === 'file' && 
              <FileUpload 
                model={getModelEndpoint(selectedModel, modelMode === 'local')}
                initialTtsModelMode={ttsModelMode}
                initialSelectedTtsModel={selectedTtsModel}
              />
            }
          </div>
        </div>
      </main>
    </div>
  );
}
