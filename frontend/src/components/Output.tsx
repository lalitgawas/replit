import { useSearchParams } from "react-router-dom";

export const Output = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const INSTANCE_URI = `http://app.${replId}.212.2.249.218.nip.io`;

    return <div style={{ flex: 1, minHeight: 0, background: "white", borderBottom: "1px solid var(--panel-border)" }}>
        <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
}