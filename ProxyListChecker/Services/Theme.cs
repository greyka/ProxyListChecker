using System.Windows.Forms;

namespace ProxyListChecker.Services;

public enum AppTheme { Light, Matrix }

public static class ThemePainter
{
    private static readonly Color MxBg     = Color.FromArgb(0, 0, 0);
    private static readonly Color MxBg2    = Color.FromArgb(10, 20, 10);
    private static readonly Color MxFg     = Color.FromArgb(0, 255, 70);
    private static readonly Color MxFgDim  = Color.FromArgb(0, 180, 60);
    private static readonly Color MxAccent = Color.FromArgb(80, 255, 130);
    private static readonly Color MxGrid   = Color.FromArgb(0, 80, 30);

    public static void Apply(Form form, AppTheme theme)
    {
        if (theme == AppTheme.Matrix) ApplyMatrix(form);
        else ApplyLight(form);
        form.Invalidate(invalidateChildren: true);
    }

    private static void ApplyMatrix(Control c)
    {
        switch (c)
        {
            case Form f:
                f.BackColor = MxBg; f.ForeColor = MxFg;
                break;
            case GroupBox g:
                g.BackColor = MxBg; g.ForeColor = MxFg;
                break;
            case Label l:
                l.BackColor = Color.Transparent;
                var tag = l.Tag as string;
                l.ForeColor = tag switch
                {
                    "status-good" => MxFg,
                    "status-bad"  => Color.FromArgb(255, 80, 80),
                    "hint"        => MxFgDim,
                    _             => MxFg,
                };
                break;
            case TextBox tb:
                tb.BackColor = MxBg; tb.ForeColor = MxFg; tb.BorderStyle = BorderStyle.FixedSingle;
                break;
            case NumericUpDown nud:
                nud.BackColor = MxBg; nud.ForeColor = MxFg;
                break;
            case ComboBox cb:
                cb.BackColor = MxBg2; cb.ForeColor = MxFg; cb.FlatStyle = FlatStyle.Flat;
                break;
            case Button btn:
                btn.FlatStyle = FlatStyle.Flat;
                btn.BackColor = MxBg2; btn.ForeColor = MxFg;
                btn.FlatAppearance.BorderColor = MxFg;
                btn.FlatAppearance.MouseOverBackColor = Color.FromArgb(0, 60, 20);
                break;
            case ProgressBar:
                break;
            case DataGridView dg:
                dg.BackgroundColor = MxBg;
                dg.GridColor = MxGrid;
                dg.DefaultCellStyle.BackColor = MxBg;
                dg.DefaultCellStyle.ForeColor = MxFg;
                dg.DefaultCellStyle.SelectionBackColor = Color.FromArgb(0, 80, 30);
                dg.DefaultCellStyle.SelectionForeColor = MxAccent;
                dg.AlternatingRowsDefaultCellStyle = new DataGridViewCellStyle
                {
                    BackColor = MxBg2,
                    ForeColor = MxFg,
                    SelectionBackColor = Color.FromArgb(0, 80, 30),
                    SelectionForeColor = MxAccent,
                };
                dg.ColumnHeadersDefaultCellStyle.BackColor = MxBg2;
                dg.ColumnHeadersDefaultCellStyle.ForeColor = MxFg;
                dg.EnableHeadersVisualStyles = false;
                dg.RowHeadersDefaultCellStyle.BackColor = MxBg2;
                break;
            case TableLayoutPanel tlp:
                tlp.BackColor = MxBg;
                break;
            case FlowLayoutPanel flp:
                flp.BackColor = MxBg;
                break;
            case Panel p:
                p.BackColor = MxBg;
                break;
            case StatusStrip ss:
                ss.BackColor = MxBg; ss.ForeColor = MxFg;
                foreach (ToolStripItem it in ss.Items) { it.BackColor = MxBg; it.ForeColor = MxFg; }
                break;
        }
        foreach (Control ch in c.Controls) ApplyMatrix(ch);
    }

    private static void ApplyLight(Control c)
    {
        switch (c)
        {
            case Form f:
                f.BackColor = SystemColors.Control; f.ForeColor = SystemColors.ControlText;
                break;
            case GroupBox g:
                g.BackColor = SystemColors.Control; g.ForeColor = SystemColors.ControlText;
                break;
            case Label l2:
                l2.BackColor = Color.Transparent;
                var t2 = l2.Tag as string;
                l2.ForeColor = t2 switch
                {
                    "status-good" => Color.DarkGreen,
                    "status-bad"  => Color.DarkRed,
                    "hint"        => Color.DimGray,
                    _             => SystemColors.ControlText,
                };
                break;
            case ComboBox cb2:
                cb2.BackColor = SystemColors.Window; cb2.ForeColor = SystemColors.WindowText; cb2.FlatStyle = FlatStyle.Standard;
                break;
            case TextBox tb:
                tb.BackColor = SystemColors.Window;
                tb.ForeColor = SystemColors.WindowText;
                // log textbox keeps black/lime
                if (tb.ReadOnly && tb.Font.Name == "Consolas")
                {
                    tb.BackColor = Color.Black; tb.ForeColor = Color.LightGreen;
                }
                tb.BorderStyle = BorderStyle.Fixed3D;
                break;
            case NumericUpDown nud:
                nud.BackColor = SystemColors.Window; nud.ForeColor = SystemColors.WindowText;
                break;
            case Button btn:
                btn.UseVisualStyleBackColor = true;
                btn.FlatStyle = FlatStyle.Standard;
                // restore accent colors set in code
                btn.ForeColor = SystemColors.ControlText;
                break;
            case DataGridView dg:
                dg.BackgroundColor = SystemColors.Window;
                dg.GridColor = SystemColors.ControlDark;
                dg.DefaultCellStyle.BackColor = SystemColors.Window;
                dg.DefaultCellStyle.ForeColor = SystemColors.WindowText;
                dg.DefaultCellStyle.SelectionBackColor = SystemColors.Highlight;
                dg.DefaultCellStyle.SelectionForeColor = SystemColors.HighlightText;
                dg.AlternatingRowsDefaultCellStyle = new DataGridViewCellStyle
                {
                    BackColor = Color.FromArgb(245, 245, 250),
                    ForeColor = SystemColors.WindowText,
                    SelectionBackColor = SystemColors.Highlight,
                    SelectionForeColor = SystemColors.HighlightText,
                };
                dg.ColumnHeadersDefaultCellStyle.BackColor = SystemColors.Control;
                dg.ColumnHeadersDefaultCellStyle.ForeColor = SystemColors.ControlText;
                dg.EnableHeadersVisualStyles = false;
                dg.RowHeadersDefaultCellStyle.BackColor = SystemColors.Control;
                break;
            case TableLayoutPanel tlp:
                tlp.BackColor = SystemColors.Control;
                break;
            case FlowLayoutPanel flp:
                flp.BackColor = SystemColors.Control;
                break;
            case Panel p:
                p.BackColor = SystemColors.Control;
                break;
            case StatusStrip ss:
                ss.BackColor = SystemColors.Control; ss.ForeColor = SystemColors.ControlText;
                foreach (ToolStripItem it in ss.Items) { it.BackColor = SystemColors.Control; it.ForeColor = SystemColors.ControlText; }
                break;
        }
        foreach (Control ch in c.Controls) ApplyLight(ch);
    }
}
