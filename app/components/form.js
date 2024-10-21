import React from 'react';

const Form = ({ topic, setTopic, format, setFormat }) => {
  const formatOptions = [
    '一个主持人，两个专家',
    '一个主持人，一个专家，一个嘉宾'
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          播客主题
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm"
          placeholder="输入播客主题"
        />
      </div>
      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          角色选择
        </label>
        <select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm"
        >
          {formatOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Form;
