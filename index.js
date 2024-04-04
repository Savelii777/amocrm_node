const http = require('http');
const express = require('express');
const { Client } = require('amocrm-js');
const cors = require('cors');
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const os = require('os');
const cron = require('node-cron');
const dotenv = require('dotenv');
const fs = require('fs');



const app = express();
app.use(cors());
dotenv.config();

// Прочитать файл config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Инициализировать переменные
const token = config.token;
const client = new Client({
    domain: config.client.domain,
    auth: {
        client_id: config.client.auth.client_id,
        client_secret: config.client.auth.client_secret,
        redirect_uri: config.client.auth.redirect_uri,
        code: config.client.auth.code,
    },
});
client.token.setValue(token);

const pool = mysql.createPool({
    host: config.pool.host,
    user: config.pool.user,
    password: config.pool.password,
    database: config.pool.database,
    port: config.pool.port,
    connectionLimit: config.pool.connectionLimit,
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
            const writeContactsIdsToFile = (id, contactId) => {
                const data = `ID: ${id}\nContact ID: ${contactId}\n`;

                fs.appendFile('contacts_ids.txt', data, (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                        return;
                    }
                    console.log('IDs successfully written to file');
                });
            };

            function readContactsIdsFromFile(callback) {
                fs.readFile('contacts_ids.txt', 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading from file:', err);
                        return;
                    }

                    if (data === '') {
                        console.log('File is empty');
                        callback({});
                        return;
                    }

                    const idContactsObj = {};
                    const regex  = /ID:\s*(\d+)\s*[\n\r]+\s*Contact ID:\s*(\d+)/g;
                    let match;

                    while ((match = regex.exec(data)) !== null) {
                        const id = match[1];
                        const contractId = match[2];
                        idContactsObj[id] = contractId;
                    }

                    callback(idContactsObj);
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


                        readContactsIdsFromFile((idContactsObj) => {
                            console.log("function");
                            if (Object.keys(idContactsObj).length === 0) {
                                setTimeout(() => {
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
                                        console.log(res.data._embedded.contacts[0].id);
                                        writeContactsIdsToFile(result.id, res.data._embedded.contacts[0].id);
                                    }).catch((error) => {
                                        console.error('Error creating leads:', error);
                                    });
                                }, 1000);
                            } else {
                                for (const id in idContactsObj) {
                                    console.log(`ID: ${id} = ${result.id}`);
                                    if (id === result.id) {
                                        console.log('ура');
                                    } else {
                                        setTimeout(() => {
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
                                                console.log(res.data._embedded.contacts[0].id);
                                                writeContactsIdsToFile(result.id, res.data._embedded.contacts[0].id);
                                            }).catch((error) => {
                                                console.error('Error creating leads:', error);
                                            });
                                        }, 1000);
                                    }
                                }
                            }
                        });



                        // setTimeout(() => {
                        //
                        // const contacts = client.request.post('/api/v4/contacts', [
                        //     {
                        //         "name": result.name + "",
                        //         "custom_fields_values": [
                        //             {
                        //                 "field_id": 449961,
                        //                 "values": [
                        //                     {
                        //                         "value": result.phone+""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 449963,
                        //                 "values": [
                        //                     {
                        //                         "value": result.email+""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 451199,
                        //                 "values": [
                        //                     {
                        //                         "value": result.vk+""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 451201,
                        //                 "values": [
                        //                     {
                        //                         "value": result.instagram+""
                        //                     }
                        //                 ]
                        //             },
                        //             {
                        //                 "field_id": 451203,
                        //                 "values": [
                        //                     {
                        //                         "value": result.telegram+""
                        //                     }
                        //                 ]
                        //             }, {
                        //                 "field_id": 451205,
                        //                 "values": [
                        //                     {
                        //                         "value": result.whatsapp+""
                        //                     }
                        //                 ]
                        //             },
                        //         ]
                        //     }
                        // ])
                        //
                        //
                        // contacts.then((res) => {
                        //     console.log(res.data._embedded.contacts[0].id);
                        //     writeContactsIdsToFile(result.id, res.data._embedded.contacts[0].id);
                        // }).catch((error) => {
                        //     console.error('Error creating leads:', error);
                        // });
                        // }, 1000);


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





