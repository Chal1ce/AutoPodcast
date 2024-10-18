import React, { useState } from 'react';
import Button from './button';
import ResponseDisplay from './ResponseDisplay';

const GenerateDialog = ({ topic, format, isLocalMode, model }) => {
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleGenerateScript = async () => {
    console.log("开始生成脚本");
    setIsLoading(true);
    setGeneratedText('');
    try {
      const requestBody = JSON.stringify({ topic, format });
      console.log("发送的请求体:", requestBody);

      // 根据isLocalMode和model选择合适的接口
      const endpoint = isLocalMode ? `local/${model}` : model;
      const response = await fetch(`${apiUrl}/${endpoint}/topic2talk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("收到响应:", data);
      
      // 直接使用后端返回的数据，不需要额外处理
      setGeneratedText(data);
    } catch (error) {
      console.error("生成脚本时出错:", error);
      setGeneratedText([{ speaker: '错误', content: `发生错误: ${error.message}` }]);
    } finally {
      setIsLoading(false);
      console.log("脚本生成结束");
    }
  }

  return (
    <div>
      <div className="mt-6 mb-4 flex justify-end">
        <Button onClick={handleGenerateScript} disabled={isLoading}>
          {isLoading ? '正在生成中...' : '生成对话文案'}
        </Button>
      </div>
      <ResponseDisplay generatedText={generatedText} isLoading={isLoading} setGeneratedText={setGeneratedText} />
    </div>
  );
};

export default GenerateDialog;
