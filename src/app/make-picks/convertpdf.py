import os
from docx2pdf import convert

read_folder_path1 = r"C:\Users\gardn\Downloads\Revised Course Syllabi Pending Fac Approval-20250914T213044Z-1-001\Revised Course Syllabi Pending Fac Approval"
read_folder_path = r"C:\Users\gardn\Downloads\Last approved syllabi for core PhD course-20250914T214336Z-1-001\Last approved syllabi for core PhD course"
# Create output folder for PDFs
output_folder = os.path.join(os.path.dirname(read_folder_path), "Converted_PDFs")
os.makedirs(output_folder, exist_ok=True)

# Convert all DOCX files to PDF
for filename in os.listdir(read_folder_path):
    if filename.lower().endswith('.docx'):
        docx_path = os.path.join(read_folder_path, filename)
        pdf_filename = os.path.splitext(filename)[0] + '.pdf'
        pdf_path = os.path.join(output_folder, pdf_filename)
        
        try:
            convert(docx_path, pdf_path)
            print(f"Converted: {filename} -> {pdf_filename}")
        except Exception as e:
            print(f"Error converting {filename}: {e}")
