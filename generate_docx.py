import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_code_block(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Left border
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text.strip())
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_callout(doc, text, title=None):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "EFF6FF")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="36" w:space="0" w:color="1D4ED8"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    if title:
        rt = p.add_run(f"📌 {title}\n")
        rt.bold = True
        rt.font.name = "Segoe UI"
        rt.font.size = Pt(10.5)
        rt.font.color.rgb = RGBColor(29, 78, 216)
    
    run = p.add_run(text.strip())
    run.font.name = "Segoe UI"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(30, 58, 138)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def create_document():
    doc = Document()
    
    # Page setup
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
    # Read Markdown
    with open("EVALUATOR_GUIDE_AND_DOCUMENTATION.md", "r", encoding="utf-8") as f:
        md_text = f.read()

    # Title Block
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("PropFlow AI: AI-Powered Email-to-Proposal Generation System")
    run_title.font.name = "Segoe UI"
    run_title.font.size = Pt(22)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Comprehensive Technical Documentation, Architecture Guide & Evaluator Manual")
    run_sub.font.name = "Segoe UI"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = RGBColor(37, 99, 235)
    run_sub.bold = True

    # Metadata Card
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    meta_table.columns[0].width = Inches(2.0)
    meta_table.columns[1].width = Inches(4.5)
    
    meta_data = [
        ("Author / Candidate", "Borra Devisree (borradevisree20@gmail.com)"),
        ("Project GitHub Repository", "https://github.com/devisree5/Proposal_AI"),
        ("Assignment Subject", "AI-Powered Email-to-Proposal Generation System"),
        ("Verification Test Suite", "node verify_all_features.js (12/12 Features Passed - 100%)"),
    ]
    
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        set_cell_background(row.cells[0], "F8FAFC")
        set_cell_background(row.cells[1], "FFFFFF")
        set_cell_margins(row.cells[0], top=60, bottom=60, left=100, right=100)
        set_cell_margins(row.cells[1], top=60, bottom=60, left=100, right=100)
        
        p0 = row.cells[0].paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(k)
        r0.font.name = "Segoe UI"
        r0.font.size = Pt(9.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(71, 85, 105)
        
        p1 = row.cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(v)
        r1.font.name = "Segoe UI"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(15, 23, 42)
        if "http" in v:
            r1.font.color.rgb = RGBColor(37, 99, 235)
            r1.underline = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Parse MD Lines
    lines = md_text.split("\n")
    i = 0
    in_code = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(tbl_lines):
        if not tbl_lines:
            return
        rows_data = []
        for line in tbl_lines:
            line_str = line.strip()
            if line_str.startswith("|") and line_str.endswith("|"):
                parts = [c.strip() for c in line_str[1:-1].split("|")]
                if not all(re.match(r"^:?-+:?$", p) for p in parts if p):
                    rows_data.append(parts)
        
        if not rows_data:
            return
        
        num_cols = max(len(r) for r in rows_data)
        doc_tbl = doc.add_table(rows=len(rows_data), cols=num_cols)
        doc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        doc_tbl.autofit = False
        
        for r_idx, r_data in enumerate(rows_data):
            row = doc_tbl.rows[r_idx]
            is_header = (r_idx == 0)
            for c_idx in range(num_cols):
                cell = row.cells[c_idx]
                val = r_data[c_idx] if c_idx < len(r_data) else ""
                val = val.replace("**", "").replace("`", "")
                
                if is_header:
                    set_cell_background(cell, "1E3A8A")
                else:
                    set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
                    
                set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                
                # borders
                tcPr = cell._element.get_or_add_tcPr()
                borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/></w:tcBorders>')
                tcPr.append(borders)
                
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                r = p.add_run(val)
                r.font.name = "Segoe UI"
                r.font.size = Pt(9.5)
                if is_header:
                    r.bold = True
                    r.font.color.rgb = RGBColor(255, 255, 255)
                else:
                    r.font.color.rgb = RGBColor(30, 41, 59)
        
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Code block handler
        if stripped.startswith("```"):
            if in_code:
                in_code = False
                add_code_block(doc, "\n".join(code_lines))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Table handler
        if stripped.startswith("|") and stripped.endswith("|"):
            in_table = True
            table_lines.append(line)
            i += 1
            continue
        elif in_table:
            in_table = False
            flush_table(table_lines)
            table_lines = []

        # Skip raw markdown metadata already in title
        if stripped.startswith("# PropFlow AI") or stripped.startswith("## Complete Evaluator Guide") or stripped.startswith("> **Repository URL"):
            i += 1
            continue
        if stripped.startswith("> **Author") or stripped.startswith("> **Project Title") or stripped.startswith("> **Document Purpose"):
            i += 1
            continue
        if stripped.startswith("## Table of Contents") or (stripped.startswith("1. [") and "](#" in stripped):
            i += 1
            continue
        if stripped == "---":
            i += 1
            continue

        # Headings
        if stripped.startswith("## "):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(16)
            h.paragraph_format.space_after = Pt(6)
            r = h.add_run(stripped[3:].strip())
            r.font.name = "Segoe UI"
            r.font.size = Pt(15)
            r.bold = True
            r.font.color.rgb = RGBColor(30, 58, 138)
            i += 1
            continue

        if stripped.startswith("### "):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(4)
            r = h.add_run(stripped[4:].strip())
            r.font.name = "Segoe UI"
            r.font.size = Pt(12.5)
            r.bold = True
            r.font.color.rgb = RGBColor(37, 99, 235)
            i += 1
            continue

        if stripped.startswith("#### "):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(2)
            r = h.add_run(stripped[5:].strip())
            r.font.name = "Segoe UI"
            r.font.size = Pt(11)
            r.bold = True
            r.font.color.rgb = RGBColor(15, 23, 42)
            i += 1
            continue

        # Bullet list
        if stripped.startswith("- ") or stripped.startswith("* "):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            content = stripped[2:].strip()
            
            # format bold and text
            parts = re.split(r'(\*\*.*?\*\*)', content)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(15, 23, 42)
                else:
                    r = p.add_run(part)
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(51, 65, 85)
            i += 1
            continue

        # Numbered list
        num_match = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if num_match:
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            content = num_match.group(2).strip()
            parts = re.split(r'(\*\*.*?\*\*)', content)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(15, 23, 42)
                else:
                    r = p.add_run(part)
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(51, 65, 85)
            i += 1
            continue

        # Normal text paragraph
        if stripped:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            
            # check callout or italic
            if stripped.startswith("> "):
                add_callout(doc, stripped[2:].strip())
                i += 1
                continue

            parts = re.split(r'(\*\*.*?\*\*|\`.*?\`)', stripped)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(15, 23, 42)
                elif part.startswith('`') and part.endswith('`'):
                    r = p.add_run(part[1:-1])
                    r.font.name = "Consolas"
                    r.font.size = Pt(9.5)
                    r.font.color.rgb = RGBColor(30, 41, 59)
                else:
                    r = p.add_run(part)
                    r.font.name = "Segoe UI"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(51, 65, 85)
        
        i += 1

    if in_table and table_lines:
        flush_table(table_lines)

    # Save to local and brain
    output_path = "PropFlow_AI_Evaluator_Guide_and_Documentation.docx"
    doc.save(output_path)
    print(f"Successfully generated {output_path}")

    # Copy to brain artifact directory as well
    brain_path = r"C:\Users\borra\.gemini\antigravity\brain\a6c33c63-b2f4-4a5f-86d1-38dd427d2e09\PropFlow_AI_Evaluator_Guide_and_Documentation.docx"
    doc.save(brain_path)
    print(f"Successfully saved to {brain_path}")

if __name__ == "__main__":
    create_document()
