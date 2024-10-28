import re
import pypdf
import docx
from fastapi import APIRouter, UploadFile, File, Body, HTTPException
from typing import List
from pydantic import BaseModel

process_router = APIRouter()

def process_pdf(file: UploadFile) -> str:
    """处理PDF文件"""
    try:
        pdf_reader = pypdf.PdfReader(file.file)
        text = ""
        for page in pdf_reader.pages:
            if len(page.extract_text()) > 5:
                text += page.extract_text()
        return text
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"文件 '{file.filename}' 无法解析。请确保上传的是有效的PDF文件。"
        )

def process_txt(file: UploadFile) -> str:
    """处理TXT文件"""
    try:
        content = file.file.read().decode('utf-8')
        return content
    except UnicodeDecodeError:
        try:
            # 尝试使用 GBK 编码
            file.file.seek(0)  # 重置文件指针
            content = file.file.read().decode('gbk')
            return content
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"文件 '{file.filename}' 编码格式不支持。请使用UTF-8或GBK编码。"
            )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"文件 '{file.filename}' 无法解析。请确保上传的是有效的TXT文件。"
        )

def process_docx(file: UploadFile) -> str:
    """处理Word文件"""
    try:
        doc = docx.Document(file.file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
        return text
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"文件 '{file.filename}' 无法解析。请确保上传的是有效的Word文件。"
        )

def clean_text(text: str) -> str:
    """清理文本"""
    # 去除引用文献
    text = re.sub(r'\[\d+\]', '', text)
    # 去除注释（假设注释是在括号内的）
    text = re.sub(r'\([^()]*\)', '', text)
    # 去除多余的空白字符
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@process_router.post("/process_file")
async def process_file(files: List[UploadFile] = File(...)):
    """
    处理多个文件的函数
    
    参数:
    files (List[UploadFile]): 文件列表，支持PDF、TXT、DOCX格式
    
    返回:
    str: 提取的文本内容
    """
    
    try:
        all_text = ""
        for file in files:
            # 获取文件扩展名并转换为小写
            file_ext = file.filename.lower().split('.')[-1]
            
            # 根据文件类型选择处理方法
            if file_ext == 'pdf':
                text = process_pdf(file)
            elif file_ext == 'txt':
                text = process_txt(file)
            elif file_ext in ['docx', 'doc']:
                text = process_docx(file)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"不支持的文件格式 '{file_ext}'。请上传 PDF、TXT 或 Word 文件。"
                )
            
            # 清理文本
            text = clean_text(text)
            all_text += text + "\n\n"
            
            # 重置文件指针，以便后续可能的操作
            file.file.seek(0)

        return all_text
    except HTTPException:
        raise
    except Exception as e:
        print(f"处理文件时出错: {str(e)}")
        return {"error": str(e)}

class DialogRequest(BaseModel):
    text: str
    role: str

@process_router.post("/generate_dialog")
async def generate_dialog(request: DialogRequest):
    """
    生成对话的函数
    
    参数:
    request (DialogRequest): 包含处理后的文本和选择的角色
    
    返回:
    dict: 生成的对话或处理结果
    """
    try:
        # 在这里处理文本和角色，生成对话
        # 这里只是一个示例，您需要根据实际需求实现对话生成逻辑
        generated_dialog = f"基于角色 '{request.role}' 生成的对话：\n{request.text[:100]}..."
        
        return {"dialog": generated_dialog}
    except Exception as e:
        print(f"生成对话时出错: {str(e)}")
        return {"error": str(e)}
