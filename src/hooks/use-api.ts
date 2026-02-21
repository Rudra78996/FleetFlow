export function useApi() {
    const getHeaders = () => {
        let token = "";
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("fleetflow-auth");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    token = parsed?.state?.token || "";
                }
            } catch {
                // ignore
            }
        }
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const get = async (url: string) => {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: "Request failed" }));
            throw new Error(data.error || "Request failed");
        }
        return res.json();
    };

    const post = async (url: string, body: unknown) => {
        const res = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    };

    const put = async (url: string, body: unknown) => {
        const res = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    };

    const del = async (url: string) => {
        const res = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    };

    return { get, post, put, del };
}
