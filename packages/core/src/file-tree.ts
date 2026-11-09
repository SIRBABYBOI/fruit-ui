export interface FileTreeFile {
  type: "file";
  id: string;
  name: string;
}

export interface FileTreeFolder {
  type: "folder";
  id: string;
  name: string;
  children: FileTreeNode[];
}

export type FileTreeNode = FileTreeFile | FileTreeFolder;
