'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Form from './components/form';
import GenerateDialog from './components/GenerateDialog';
import ResponseDisplay from './components/ResponseDisplay';

// 动态导入 FileUpload 组件
const FileUpload = dynamic(() => import('./components/FileUpload'), { ssr: false });

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('prompt');
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('一个主持人，一个嘉宾，一个专家');
  const [generatedText, setGeneratedText] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    { value: 'prompt', label: '提示词生成播客音频' },
    { value: 'file', label: '根据文件生成播客音频' }
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
        <div className="flex justify-between items-center mb-6">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
