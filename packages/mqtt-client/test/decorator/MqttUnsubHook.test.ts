// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { MqttUnsubHook } from "../../src/decorator/MqttUnsubHook";
import { UNSUBSCRIBE_HOOK_NAME } from "../../src/decorator/constants";

it("should add method name to property", () => {
    class testClass1 {
        @MqttUnsubHook()
        destroy() {}
    }

    const t = new testClass1();

    expect((t as any)[UNSUBSCRIBE_HOOK_NAME]).toBe("destroy");
});

it("should throw when decorating a setter/getter", () => {
    expect(() => {
        class testClass1 {
            @MqttUnsubHook()
            get destory(): number {
                return 1;
            }
        }
    }).toThrow();

    expect(() => {
        class testClass1 {
            @MqttUnsubHook()
            set destory(d: number) {}
        }
    }).toThrow();
});
