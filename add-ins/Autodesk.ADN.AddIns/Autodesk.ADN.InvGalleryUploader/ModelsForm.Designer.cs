namespace Autodesk.ADN.InvGalleryUploader
{
  partial class ModelsForm
  {
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    /// Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
      if (disposing && (components != null))
      {
        components.Dispose();
      }
      base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
      this.btnClose = new System.Windows.Forms.Button();
      this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
      this.lbxModels = new System.Windows.Forms.ListBox();
      this.tableLayoutPanel1.SuspendLayout();
      this.SuspendLayout();
      // 
      // btnClose
      // 
      this.btnClose.DialogResult = System.Windows.Forms.DialogResult.OK;
      this.btnClose.Location = new System.Drawing.Point(316, 192);
      this.btnClose.Name = "btnClose";
      this.btnClose.Size = new System.Drawing.Size(74, 23);
      this.btnClose.TabIndex = 0;
      this.btnClose.Text = "Close";
      this.btnClose.UseVisualStyleBackColor = true;
      // 
      // tableLayoutPanel1
      // 
      this.tableLayoutPanel1.ColumnCount = 2;
      this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
      this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 80F));
      this.tableLayoutPanel1.Controls.Add(this.btnClose, 1, 1);
      this.tableLayoutPanel1.Controls.Add(this.lbxModels, 0, 0);
      this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
      this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 0);
      this.tableLayoutPanel1.Name = "tableLayoutPanel1";
      this.tableLayoutPanel1.RowCount = 2;
      this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
      this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
      this.tableLayoutPanel1.Size = new System.Drawing.Size(393, 219);
      this.tableLayoutPanel1.TabIndex = 1;
      // 
      // lbxModels
      // 
      this.tableLayoutPanel1.SetColumnSpan(this.lbxModels, 2);
      this.lbxModels.Dock = System.Windows.Forms.DockStyle.Fill;
      this.lbxModels.FormattingEnabled = true;
      this.lbxModels.Location = new System.Drawing.Point(3, 3);
      this.lbxModels.Name = "lbxModels";
      this.lbxModels.Size = new System.Drawing.Size(387, 183);
      this.lbxModels.TabIndex = 1;
      // 
      // ModelsForm
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.ClientSize = new System.Drawing.Size(393, 219);
      this.Controls.Add(this.tableLayoutPanel1);
      this.Name = "ModelsForm";
      this.Text = "Uploaded models";
      this.tableLayoutPanel1.ResumeLayout(false);
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.Button btnClose;
    private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
    private System.Windows.Forms.ListBox lbxModels;
  }
}