const http = require('http');
const express = require('express');
const { Client } = require('amocrm-js');
const cors = require('cors');
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const os = require('os');
const cron = require('node-cron');
const fs = require('fs');



const app = express();
app.use(cors());

const token = {
    "token_type": "Bearer",
    "expires_in": 86400,
    "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijk2YzFiYTQ0N2ExYThiMDczMWIyMDA4YTkxYTIxNzhhN2RkZTgzNTVjMjU5NGE0Y2ZiN2QyOTk4MmI5MGZkNjY1ZGYyYzVhOGNlYjYyYTU4In0.eyJhdWQiOiI2ZDJmZjBlZi03MmRiLTQ4ZTAtYjFiNS1lODJkNWViYmZhMTciLCJqdGkiOiI5NmMxYmE0NDdhMWE4YjA3MzFiMjAwOGE5MWEyMTc4YTdkZGU4MzU1YzI1OTRhNGNmYjdkMjk5ODJiOTBmZDY2NWRmMmM1YThjZWI2MmE1OCIsImlhdCI6MTcxMjIxNzEwMSwibmJmIjoxNzEyMjE3MTAxLCJleHAiOjE3NDQyNDMyMDAsInN1YiI6IjEwNzgzMzE4IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNjc5ODAyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMjE1OTdlZWItMDAzMi00OTA0LWI5NTItOGJiYWI0MTdlZWNmIn0.O758bUphis2-9E3-GZ_i32-S6gKQzQNES89GNMItk39mykEK0fKnwrkWVKHEF-ISapkD3bncjx41A7y4Fog8CsanoTP4JpgT1fR6A3woxiWePsOpweGMcK0YNK2yQkwsbtQD6c2TuhFl6B6153Mnh6BaPTtqHV98r5mS-DLGI2AVAxaJr7kxb1mOtbGZayj-2LllBROyJcYBXX3BntuFbH6B2sFIaHllLgTnxpcg_-aov1S0cbZiBeT_q7AitbOuLbflCskCOIVmXKclTj1rUz0fv_6xkfwGULu4EmztFvYc6RFhdYttFxyazGBJJ1IQfGw07_kYUvtE6fztkPl6MQ"
};

const client = new Client({
    domain: 'savelii777',
    auth: {
        client_id: '6d2ff0ef-72db-48e0-b1b5-e82d5ebbfa17',
        client_secret: 'kiQaUAGryAJNigag2kJbfbu7DQOtaZoQZBCqHIEktLQ94oezPD44TsIbznPgcJO1',
        redirect_uri: 'https://домик-влесу.рф/',
        code: 'def502007fe04c121790523cb495421e2cefbddefbc611628b5eabbb70c52da3676304767d32948a300fc44bac67183cc1f55baed512393c0ee1eb2073df08dfc02254e591370a8468383b443eaf2ea374f61de3ddc615c681592a26a20ca5af39378ead09377dae8213fb197b865cf2145cea5b1b5143dd1cb6d32e55bc9b0953635056aa4aa70513d2124f55337716e9016cf7fb795f6cb4261e6497dfc3747965d2f47cc0bc7757057ea2cd9752c80bf7304575b5142fce5c34e5978b90d6748a6d6ae58a15103f17117c03e5cea51cfc131770061b4ca34631f2f44593eb67cd98c67c675d69b6c90a8dcd6e712c96ebb9827d4185ed433d644a71b2f3b06f6b54d978f5c6619d4f377bd5e5ca6fcb47a2fedac6aa18f7704346fe7c49e68bf1964941daf6406fd848e4d6ae22dc70aac3e5f3e9199ff5cf7d5282b1540d7ebaf88db0402b8749f399239f78a67ad5dcf0ca699bb0542c7145f3b957eb692e6daaf694798101698ab883e5439da4453861b830f3fa008a4a010c06fba9cac4017a37cff5365c66b2b48c7fb7e9422256f6e640ca958eb6b8ac001d5855ec66dd79e71f870075a3c887f350c455672b9d38ffad6a2461559413f4d211461c914f3ef544c879b9e7d406ab89beeab676b077328e020e3bf1d526486dad6e179e072ea9da9a15a68953547b5dffba31fb2c826b730f65'
    },
});

client.token.setValue(token);

const pool = mysql.createPool({
    host: 'localhost',
    user: 'admin_d-vlesu',
    password: 'cb37J8tK02',
    database: 'admin_d-vlesu',
    port: 3306,
    connectionLimit: 10, // Установить максимальное количество соединений в пуле
});

pool.on('error', (error) => {
    console.error('Ошибка подключения к базе данных:', error);
});

const bookingStatus = {
    NEW: 65270938,
    CONFIRMED: 65270942,
    CHECKED_IN: 65270946,
    CHECKED_OUT: 65370418,
    CANCELED: 65370422
};

// Получение соединения из пула
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключено к базе данных');


    const runTask = () => {
        // const query = `SELECT bookings.*, clients.* FROM bookings INNER JOIN clients ON bookings.client_id = clients.id WHERE bookings.created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) ORDER BY bookings.created_at DESC;`;
        const query = 'SELECT bookings.*, clients.* FROM bookings INNER JOIN clients ON bookings.client_id = clients.id ORDER BY bookings.created_at DESC LIMIT 5';

        connection.query(query, (err, results) => {
            console.log(query);

            function writeIdsToFile(id, transactionId) {
                const data = `ID: ${id}\nTransaction ID: ${transactionId}\n`;

                fs.appendFile('ids.txt', data, (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                        return;
                    }
                    console.log('IDs successfully written to file');
                });
            }
            function writeContactsIdsToFile(id, contsctId) {
                const data = `ID: ${id}\nContact ID: ${contsctId}\n`;

                fs.appendFile('contacts_ids.txt', data, (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                        return;
                    }
                    console.log('IDs successfully written to file');
                });
            }

            function formatDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                const timezoneOffset = String(date.getTimezoneOffset() / -60).padStart(2, '0');

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+${timezoneOffset}:00`;
            }

            //-------------------------------------------------------------------------

            if (results.length > 0) {
                for (const result of results) {
                    setTimeout(() => {
                        const today = result.begin;
                        const tomorrow = result.end;

                        const formattedToday = formatDate(today);
                        const formattedTomorrow = formatDate(tomorrow);

                        const guestCount = parseInt(result.guest_count, 10);
                        console.log(result)
                        const contacts = client.request.post('/api/v4/contacts', [
                            {
                                "name": result.name + "",
                                "custom_fields_values": [
                                    {
                                        "field_id": 449961,
                                        "values": [
                                            {
                                                "value": result.phone+""
                                            }
                                        ]
                                    },
                                    {
                                        "field_id": 449963,
                                        "values": [
                                            {
                                                "value": result.email+""
                                            }
                                        ]
                                    },
                                    {
                                        "field_id": 451199,
                                        "values": [
                                            {
                                                "value": result.vk+""
                                            }
                                        ]
                                    },
                                    {
                                        "field_id": 451201,
                                        "values": [
                                            {
                                                "value": result.instagram+""
                                            }
                                        ]
                                    },
                                    {
                                        "field_id": 451203,
                                        "values": [
                                            {
                                                "value": result.telegram+""
                                            }
                                        ]
                                    }, {
                                        "field_id": 451205,
                                        "values": [
                                            {
                                                "value": result.whatsapp+""
                                            }
                                        ]
                                    },
                                ]
                            }
                        ])


                        contacts.then((res) => {
                            console.log(res.data._embedded);
                            // writeIdsToFile(result.id, res.data[0].id);
                        }).catch((error) => {
                            console.error('Error creating leads:', error);
                        });
                        // const leads = client.request.post('/api/v4/leads/complex', [
                        //     {
                        //         "name": result.id + "",
                        //         "price": result.sum_full,
                        //         "custom_fields_values": [
                        //             {
                        //                 "field_id": 1527477,
                        //                 "field_name": "Начало",
                        //                 "field_code": null,
                        //                 "field_type": "date",
                        //                 "values": [
                        //                     {
                        //                         "value": formattedToday
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527479,
                        //                 "field_name": "Конец",
                        //                 "field_code": null,
                        //                 "field_type": "date",
                        //                 "values": [
                        //                     {
                        //                         "value": formattedTomorrow
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527481,
                        //                 "field_name": "Комментарий",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.notes + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527483,
                        //                 "field_name": "Предоплата",
                        //                 "field_code": null,
                        //                 "field_type": "numeric",
                        //                 "values": [
                        //                     {
                        //                         "value": result.sum_prepaid
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527491,
                        //                 "field_name": "Скидка",
                        //                 "field_code": null,
                        //                 "field_type": "numeric",
                        //                 "values": [
                        //                     {
                        //                         "value": result.percent_off
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527493,
                        //                 "field_name": "Количество гостей",
                        //                 "field_code": null,
                        //                 "field_type": "numeric",
                        //                 "values": [
                        //                     {
                        //                         "value": guestCount
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527495,
                        //                 "field_name": "Имя",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.name + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527497,
                        //                 "field_name": "Телефон",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.phone + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527499,
                        //                 "field_name": "Почта",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.email + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527501,
                        //                 "field_name": "ВК",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.vk + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527503,
                        //                 "field_name": "Инстаграм",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.instagram + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527505,
                        //                 "field_name": "Телеграм",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.telegram + ""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 1527507,
                        //                 "field_name": "Ватсап",
                        //                 "field_code": null,
                        //                 "field_type": "text",
                        //                 "values": [
                        //                     {
                        //                         "value": result.whatsapp + ""
                        //                     }
                        //                 ]
                        //             }
                        //         ],
                        //         "score": null,
                        //         "account_id": 31623822,
                        //         "created_at": 1608905348,
                        //         "status_id": 65270938,
                        //         "pipeline_id": 7948234,
                        //     },
                        // ]);
                        //
                        // leads.then((createdLead) => {
                        //     console.log('Lead created successfully with ID:', createdLead.data[0].id);
                        //     writeIdsToFile(result.id, createdLead.data[0].id);
                        // }).catch((error) => {
                        //     console.error('Error creating leads:', error);
                        // });


                        //-------------------------------------------------------------------------


                        if (err) {
                            console.error('Error executing database query1:', err);
                            return;
                        }

                        if (results.length > 0) {

                        } else {
                            console.log('No results found');
                        }

                        function readIdsFromFile(callback) {
                            fs.readFile('ids.txt', 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading from file:', err);
                                    return;
                                }

                                if (data === '') {
                                    console.log('File is empty');
                                    callback({});
                                    return;
                                }

                                const idTransactionObj = {};
                                const regex = /ID:\s*(\d+)\s*Transaction ID:\s*(\d+)/g;
                                let match;

                                while ((match = regex.exec(data)) !== null) {
                                    const id = match[1];
                                    const transactionId = match[2];
                                    idTransactionObj[id] = transactionId;
                                }

                                callback(idTransactionObj);
                            });
                        }


                        readIdsFromFile((idTransactionObj) => {
                            Object.entries(idTransactionObj).forEach(([id, transactionId]) => {
                                const statuses = client.request.get(`/api/v4/leads/${transactionId}`);
                                statuses.then((response) => {
                                    const result = results.find((result) => result.id == id);
                                    // console.log(response.data.status_id, result.id, id)
                                    if (result.booking_status_id == 1 && bookingStatus.NEW != response.data.status_id) {
                                        if (bookingStatus.CONFIRMED == response.data.status_id) {
                                            const query1 = `UPDATE bookings SET booking_status_id = 2 WHERE client_id = ${id}`;
                                            connection.query(query1, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 2 for client ID: ${id}`);
                                            });
                                        }
                                        if (bookingStatus.CANCELED == response.data.status_id) {
                                            const query2 = `UPDATE bookings SET booking_status_id = 3 WHERE client_id = ${id}`;
                                            connection.query(query2, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 3 for client ID: ${id}`);
                                            });
                                        }
                                    }
                                    if (result.booking_status_id == 2 && bookingStatus.CONFIRMED != response.data.status_id) {
                                        if (bookingStatus.NEW == response.data.status_id) {
                                            const query1 = `UPDATE bookings SET booking_status_id = 1 WHERE client_id = ${id}`;
                                            connection.query(query1, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 1 for client ID: ${id}`);
                                            });
                                        }
                                        if (bookingStatus.CANCELED == response.data.status_id) {
                                            const query2 = `UPDATE bookings SET booking_status_id = 3 WHERE client_id = ${id}`;
                                            connection.query(query2, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 3 for client ID: ${id}`);
                                            });
                                        }
                                    }
                                    if (result.booking_status_id == 3 && bookingStatus.CANCELED != response.data.status_id) {
                                        if (bookingStatus.CONFIRMED == response.data.status_id) {
                                            const query1 = `UPDATE bookings SET booking_status_id = 1 WHERE client_id = ${id}`;
                                            connection.query(query1, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 1 for client ID: ${id}`);
                                            });
                                        }
                                        if (bookingStatus.NEW == response.data.status_id) {
                                            const query2 = `UPDATE bookings SET booking_status_id = 1 WHERE client_id = ${id}`;
                                            connection.query(query2, (err, result) => {
                                                if (err) {
                                                    console.error('Error executing database query:', err);
                                                    return;
                                                }
                                                console.log(`Updated booking_status_id to 1 for client ID: ${id}`);
                                            });
                                        }
                                    }
                                }).catch((error) => {
                                    console.error(error);
                                });
                            });
                        });


                    }, 1000 * (results.indexOf(result) + 1));
                }




            } else {
                console.log('No results found');
            }
        });
    }
    runTask();
    setInterval(runTask, 1000);
    connection.release();
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.on('error', (error) => {
    console.error('Error starting server:', error);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});





