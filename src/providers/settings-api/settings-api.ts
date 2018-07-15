import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { SettingsKey } from '../../Enums/settings-key.enum';

@Injectable()
export class SettingsApiProvider {
  private settingsApiUrl: string = '/api/SettingsApi';

  constructor(public http: HttpClientWithLoader) { }

  public getSettingValue(settingsKey: SettingsKey): Promise<string> {
    return this.http
      .post<string>(`${this.settingsApiUrl}/GetSettingValue`, settingsKey)
      .then(value => {
        return value;
      });
  }
}
