import { useEffect, useMemo} from "react";
import Sidebar from "./external/editor/components/sidebar";
import { Code } from "./external/editor/editor/code";
import styled from "@emotion/styled";
import { type File, buildFileTree, type RemoteFile } from "./external/editor/utils/file-manager";
import { FileTree } from "./external/editor/components/file-tree";
import { Socket } from "socket.io-client";

// credits - https://codesandbox.io/s/monaco-tree-pec7u
export const Editor = ({
    files,
    onSelect,
    selectedFile,
    socket
}: {
    files: RemoteFile[];
    onSelect: (file: File) => void;
    selectedFile: File | undefined;
    socket: Socket | undefined;
}) => {
    const rootDir = useMemo(() => {
        return buildFileTree(files);
    }, [files]);

    useEffect(() => {
        if (!selectedFile) {
            onSelect(rootDir.files[0])
        }
    }, [selectedFile])

    return (
        <EditorContainer>
            <Main>
                <Sidebar>
                    <FileTree
                        rootDir={rootDir}
                        selectedFile={selectedFile}
                        onSelect={onSelect}
                    />
                </Sidebar>
                <Code socket={socket ?? undefined} selectedFile={selectedFile} />
            </Main>
        </EditorContainer>
    );
};

const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
`;