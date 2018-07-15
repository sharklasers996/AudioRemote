import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { SettingsKey } from '../../enums/settings-key.enum';
import { Environment } from '../../constants/environment';

@Injectable()
export class SettingsApiProvider {
  private settingsApiUrl: string = Environment.ApiUrl + '/api/SettingsApi';

  constructor(public http: HttpClientWithLoader) { }

  public getSettingValue(settingsKey: SettingsKey): Promise<any> {
    return this.http
      .post<any>(`${this.settingsApiUrl}/GetSettingValue`, settingsKey)
      .then(value => {
        return value;
      });
  }

  public updateSettingValue(settingsKey: SettingsKey, settingValue: any) {
    this.http
      .post(
        `${this.settingsApiUrl}/UpdateSettingValue`,
        {
          settingsKey: settingsKey,
          value: settingValue
        });
  }
}
