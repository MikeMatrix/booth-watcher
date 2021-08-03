import * as child_process from 'child_process';

export function nop(..._args: any[]): any {}

export async function exec(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      child_process.exec(command, (err, stdout, _stderr) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(stdout);
      });
    } catch (err) {
      reject(err);
    }
  });
}
