import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { Commands } from '../../enums/commands.enum';
import { CommandClient } from '../../enums/command-client.enum';

@Injectable()
export class CommandQueueApiProvider {
  private commandQueueApiUrl: string = '/api/CommandQueueApi';

  constructor(public http: HttpClientWithLoader) { }

  public addCommand(command: Commands, value: any) {
    this.http
      .post(
        `${this.commandQueueApiUrl}/AddCommand`,
        {
          CommandsEnum: command,
          CommandClient: CommandClient.Audio,
          CommandValue: value
        });
  }
}
