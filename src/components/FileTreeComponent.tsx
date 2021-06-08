import React, { useState } from 'react';
// @ts-ignore
import { TFile, App, Keymap } from 'obsidian';
import { FileTreeView } from 'src/FileTreeView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

interface FileTreeProps {
    files: TFile[],
    app: App,
    folderPath: string,
    fileTreeView?: FileTreeView
}

export function FileTreeComponent({ files, app, folderPath, fileTreeView }: FileTreeProps) {

    const [activeFile, setActiveFile] = useState(null);

    const openFile = (file: TFile, e: React.MouseEvent) => {
        app.workspace.openLinkText(file.path, "/", Keymap.isModifier(e, "Mod") || 1 === e.button);
        setActiveFile(file);
    }

    const triggerContextMenu = (file: TFile, e: React.MouseEvent) => {
        // @ts-ignore
        fileTreeView.app.workspace.onLinkContextMenu(e, file.path, file.path);
    }

    const getFileNameAndExtension = (fullName: string) => {
        var index = fullName.lastIndexOf('.');
        return {
            fileName: fullName.substring(0, index),
            extension: fullName.substring(index + 1)
        }
    }

    const getFolderName = (folderPath: string) => {
        if (folderPath === '/') return app.vault.getName();
        let index = folderPath.lastIndexOf('/');
        if (index !== -1) return folderPath.substring(index + 1);
        return folderPath;
    }

    const sortedFiles = files.sort((a, b) => {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    })

    const createNewFile = async (e: React.MouseEvent, folderPath: string) => {
        let targetFolder = app.vault.getAbstractFileByPath(folderPath);
        if (!targetFolder) return;
        // @ts-ignore
        const newFile = await app.fileManager.createNewMarkdownFile(targetFolder, 'Untitled');
        const newLeaf = app.workspace.activeLeaf
        await newLeaf.openFile(newFile);
        app.workspace.setActiveLeaf(newLeaf, false, true);
    }

    return (
        <React.Fragment>
            <div className="oz-flex-container">
                <div className="oz-file-tree-header">
                    {getFolderName(folderPath)}
                </div>
                <div className="nav-action-button">
                    <FontAwesomeIcon icon={faPlusCircle} onClick={(e) => createNewFile(e, folderPath)} />
                </div>
            </div>
            {sortedFiles.map(file => {
                return (
                    <div className="nav-file oz-nav-file" key={file.path} onClick={(e) => openFile(file, e)} onContextMenu={(e) => triggerContextMenu(file, e)}>
                        <div className={'nav-file-title oz-nav-file-title' + (activeFile === file ? ' is-active' : '')} data-path={file.path}>
                            {
                                getFileNameAndExtension(file.name).extension !== 'md' &&
                                <span className="nav-file-tag">
                                    {getFileNameAndExtension(file.name).extension}
                                </span>
                            }
                            <div className="nav-file-title-content">
                                {getFileNameAndExtension(file.name).fileName}
                            </div>
                        </div>
                    </div>
                )
            })}
        </React.Fragment>
    )
}