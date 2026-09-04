import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Editor } from './Editor';
import { type File, type RemoteFile } from './external/editor/utils/file-manager';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Output } from './Output';
import { TerminalComponent as Terminal } from './Terminal';
import axios from 'axios';

function useSocket(replId: string) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(`ws://ws.${replId}.212.2.249.218.nip.io`);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [replId]);

    return socket;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-color);
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--panel-bg);
  border-bottom: 1px solid var(--panel-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const Brand = styled.div`
  color: white;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  color: ${props => props.active ? 'var(--accent-primary)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'rgba(99, 102, 241, 0.3)' : 'var(--panel-border)'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: var(--text-primary);
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const Workspace = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--panel-border);
  min-width: 0;
  height: 100%;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  min-width: 0;
  height: 100%;
`;

export const CodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';

    useEffect(() => {
        if (replId) {
            const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL || "/api/orchestrator";
            axios.post(`${orchestratorUrl}/start`, { replId })
                .then(() => setPodCreated(true))
                .catch((err) => console.error(err));
        }
    }, []);

    if (!podCreated) {
        return <>Booting...</>
    }
    return <CodingPagePostPodCreation />

}

export const CodingPagePostPodCreation = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(replId);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [showOutput, setShowOutput] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
                setLoaded(true);
                setFileStructure(rootContent);
            });
        }
    }, [socket]);

    const onSelect = (file: File) => {
        if (file.type === "DIRECTORY") {
            socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
                setFileStructure(prev => {
                    const allFiles = [...prev, ...data];
                    return allFiles.filter((file, index, self) =>
                        index === self.findIndex(f => f.path === file.path)
                    );
                });
            });
        } else {
            socket?.emit("fetchContent", { path: file.path }, (data: string) => {
                file.content = data;
                setSelectedFile(file);
            });
        }
    };

    if (!loaded) {
        return "Loading...";
    }

    return (
        <Container>
            <TopBar>
                <Brand>Replit</Brand>
                <ToggleButton 
                    active={showOutput} 
                    onClick={() => setShowOutput(!showOutput)}
                >
                    {showOutput ? 'Hide Output' : 'Show Output'}
                </ToggleButton>
            </TopBar>
            <Workspace>
                <LeftPanel>
                    <Editor socket={socket ?? undefined} selectedFile={selectedFile} onSelect={onSelect} files={fileStructure} />
                </LeftPanel>
                <RightPanel>
                    {showOutput && <Output />}
                    <Terminal socket={socket ?? undefined} />
                </RightPanel>
            </Workspace>
        </Container>
    );
}