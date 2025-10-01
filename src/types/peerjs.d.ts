declare module 'peerjs' {
    interface PeerOptions {
        host?: string;
        port?: number;
        path?: string;
        config?: {
            iceServers?: Array<{ urls: string }>;
        };
        debug?: number;
    }

    interface MediaConnection {
        peer: string;
        answer(stream?: MediaStream): void;
        on(event: string, callback: (data?: any) => void): void;
    }

    class Peer {
        constructor(id?: string, options?: PeerOptions);
        on(event: 'open', callback: (id: string) => void): void;
        on(event: 'error', callback: (error: any) => void): void;
        on(event: 'call', callback: (call: MediaConnection) => void): void;
        call(id: string, stream: MediaStream): MediaConnection;
        answer(stream: MediaStream): void;
        destroy(): void;
    }

    export = Peer;
}
