// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tConnectionToUseInfo } from "./client/MqttClient";
import { CONNECTION_TO_USE_INFO } from "./constants";

/**
 * Defines which underlying client object to use of that class. Can be either set on a property or getter of type Client, or on a constructor parameter
 */
export function MqttConnection() {
    return (
        target: any,
        propertyKey: string | symbol | undefined, //The undefined is a "workaroundish" way to handle parameter decorators in the constructor
        descriptor?: PropertyDescriptor | number,
    ) => {
        if (propertyKey !== undefined && typeof propertyKey === "symbol") {
            throw new Error(
                "MqttConnection can not be set on symbol key property",
            );
        }
        if (typeof descriptor === "number") {
            //Parameter decorator
            (target[CONNECTION_TO_USE_INFO] as tConnectionToUseInfo) =
                descriptor;
        } else if (descriptor === undefined || descriptor.get !== undefined) {
            //Property or Getter
            (target[CONNECTION_TO_USE_INFO] as tConnectionToUseInfo) =
                propertyKey!;
        } else {
            //Setter or Method
            throw new Error(
                "MqttConnection can not be set on getter or method",
            );
        }
    };
}
