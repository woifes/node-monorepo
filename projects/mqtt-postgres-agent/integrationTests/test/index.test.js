// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

const { connect } = require("mqtt");
const { Pool } = require("pg");

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

it(
    "should insert entries correctly",
    async () => {
        const mqttClient = connect(process.env.MQTT_URL, {
            clientId: "test01",
            username: "",
            password: "",
        });

        await wait(2000);
        const now1 = Date.now();
        mqttClient.publish("A/myInfo/C", "123", { retain: true });

        await wait(200);
        const now2 = Date.now();
        mqttClient.publish("A/myInfo02/C", "456", { retain: true });

        await wait(200);
        const now3 = Date.now();
        mqttClient.publish("A/myInfo03/C", "789", { retain: true });
        await wait(2000);

        const pool = new Pool();
        const res = await pool.query("SELECT * from testtable");

        expect(res.rowCount).toBe(3);

        let item = res.rows[0];
        expect(item.time.getTime() - now1).toBeLessThanOrEqual(100);
        expect(item.info).toBe("myInfo");
        expect(item.value).toBe("123");
        expect(item.name).toBe("foo");

        item = res.rows[1];
        expect(item.time.getTime() - now2).toBeLessThanOrEqual(100);
        expect(item.info).toBe("myInfo02");
        expect(item.value).toBe("456");
        expect(item.name).toBe("foo");

        item = res.rows[2];
        expect(item.time.getTime() - now3).toBeLessThanOrEqual(100);
        expect(item.info).toBe("myInfo03");
        expect(item.value).toBe("789");
        expect(item.name).toBe("foo");
    },
    5 * 60 * 1000,
);
