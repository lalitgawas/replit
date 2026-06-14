import { useSearchParams } from "react-router-dom";

export const Output = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const INSTANCE_URI = `http://app.${replId}.34.27.254.212.nip.io`;

    return <div style={{ height: "40vh", background: "white" }}>
        <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
}