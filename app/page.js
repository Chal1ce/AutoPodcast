'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Form from './components/form';
import GenerateDialog from './components/GenerateDialog';
import ResponseDisplay from './components/ResponseDisplay';
import ToggleButton from './components/ToggleButton';

// 动态导入 FileUpload 组件
const FileUpload = dynamic(() => import('./components/FileUpload'), { ssr: false });

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('prompt');
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('一个主持人，一个嘉宾，一个专家');
  const [generatedText, setGeneratedText] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelMode, setModelMode] = useState('api');
  const [selectedModel, setSelectedModel] = useState('deepseek');

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

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-md mx-auto space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <select
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
          
          <div className="flex justify-between items-start space-x-4">
            <div className="flex flex-col items-start w-1/2">
              <span className="model-select-label">选择生成对话文本的模式：</span>
              <ToggleButton
                options={modelModes}
                selectedOption={modelMode}
                onSelect={setModelMode}
              />
            </div>
            
            <div className="flex flex-col items-start w-1/2">
              <span className="model-select-label">选择模型：</span>
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
              <GenerateDialog 
                topic={topic} 
                format={format} 
                setGeneratedText={setGeneratedText}
                setIsLoading={setIsLoading}
                isLocalMode={modelMode === 'local'}
                model={selectedModel}
              />
              <ResponseDisplay 
                generatedText={generatedText}
                isLoading={isLoading}
                setGeneratedText={setGeneratedText}
                onConfirm={handleConfirm}
              />
            </>
          )}
          
          {selectedOption === 'file' && <FileUpload />}
        </div>
      </main>
    </div>
  );
}
