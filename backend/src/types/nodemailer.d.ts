declare module 'nodemailer' {
  import type { EventEmitter } from 'events';

  export interface TransportOptions {
    service?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
    [key: string]: any;
  }

  export interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    [key: string]: any;
  }

  export interface SentMessageInfo {
    messageId?: string;
    rejected?: string[];
    response?: string;
    [key: string]: any;
  }

  export interface Transporter extends EventEmitter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
    verify(): Promise<boolean>;
    close(): Promise<void>;
  }

  export function createTransport(
    options?: TransportOptions | string,
    defaults?: SendMailOptions
  ): Transporter;

  export default {
    createTransport,
  };
}
