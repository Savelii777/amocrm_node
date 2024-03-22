const http = require('http');
const express = require('express');
const { Client } = require('amocrm-js');
const cors = require('cors');
const mysql = require('mysql');
const MySQLEvents = require('mysql-events');

const app = express();
app.use(cors());

const token = {
    "token_type": "Bearer",
    "expires_in": 86400,
    "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImEwODM5NTk0NTRkZjhjYjYwYjQ2MDZkYTM5M2JiNTcyZTU2YWMxNWMzMzg0YTBkNGMyNDI5YWY0Y2U5MzFjZTMxOWNiM2Y0OGY5MmJkY2JkIn0.eyJhdWQiOiI2YWU3MmIyNi1mNDViLTQ3MzktOWYwOS1kMmRmYjk4ZDQ4YTgiLCJqdGkiOiJhMDgzOTU5NDU0ZGY4Y2I2MGI0NjA2ZGEzOTNiYjU3MmU1NmFjMTVjMzM4NGEwZDRjMjQyOWFmNGNlOTMxY2UzMTljYjNmNDhmOTJiZGNiZCIsImlhdCI6MTcxMDkwNDUyNywibmJmIjoxNzEwOTA0NTI3LCJleHAiOjE3MTE4NDMyMDAsInN1YiI6IjEwNzgzMzE4IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNjIzODIyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZDI2ODBkYTMtMTBkMy00NjgzLTk2NDgtYTU3YWZjNzMzMmFmIn0.AjX7OP1-n_XFfVQVFJqEbe1ZlE0EJRpFt-0aAK2FC6PtzCJ4E_WdGOu34T4DjKL3tI0oSaGuwDy23ZzJamHfomAGTQBUhGBwm-tnRhvGQ0pxGyEtEOsu2vxHhUx1dlvIT1zObnZxrZdP96nkyuqqAnJV_ih_W7VbZzbh4uw_nSfECBohqi9h9PdcrqLVPgGU0gXOFfEoaIDuWCC71KOemW0KiOmoG7QVuNMJE5OHlv_Htb0PmqAtRmz_kqqqH5___37UCP0AmwavRCGan_gbCkpCbM6rrr0ASznJk6G3vRS81lLQ3ji5gYoZRUll0tX_SUsXvRbWfngQuLVNXcYQVQ"
};

const client = new Client({
    domain: 'kristinakp04',
    auth: {
        client_id: '6ae72b26-f45b-4739-9f09-d2dfb98d48a8',
        client_secret: '7uvwl6nzpeRdi7UAQWwSWcyTaIV48sedyl2wKb2PyfylJRT0eMNBWUQ7roJLh74b',
        redirect_uri: 'https://домик-влесу.рф/',
        code: 'def50200dca980050ec0d443e968cf1d8bc8e8b0637746f58ac951fcc878a370b3a699febec7994464d0f191fa64d413b0139d10079970981252969d2ec5c946337b06ecf25bf38c907da627bf021a19ec2a20cf865e27189ba0dbeeae2aede2934331158271557d9723dd057cf23a771c73171849f10842b07d6cfd66aea7cad5a8c1cb90c52be7782d317c0b6f2fb834aa5f2809f6b1622e009834bb3c5a4d260ebe6a5029d816066380ad9ef99464b46052a80bea01f08a0c29292d144bb6a7d7283d02cb6a8f30511422290f1d019a20be297687b55a6c0fff16f62a97fbcc6e901a98185f0177ad1ce0ccc9137307ec80fc4313fbe62c2a9f3c2caf39f3f210db54c96bcc4a9de24d58c57f94010f226519b8d2f0b4140b185d83dc5835a09936254cfab246df455156423408bc47ecef2c50bf272ede8d936eefc9a8fc9e2cdb8740acc2b9a85f0ebec83f00debc5dcb23a698abd98ccd6fdbfe5125077e25412bfe951b0e53ecd4a79d9e4dcf973db7f9e4a5706b7648b08a4de48bd6b4dbe4cf62123f78ebce0fb6b02b2a9100c2cef39e60711b28ca4bcececb83f23bfc5fcf5a0a13a723696d3d348e1c4037005d7820e2a7a0e5c14c36657b0920e171f8a5ea880951785ed4ec77190601827c53d1690707ff03ef409f66cc14977a61cba4563971a208bdd8b50986e04ea786cddcff9e6d'
    },
});

client.token.setValue(token);


const connection = mysql.createConnection({
    host: 'localhost', // адрес сервера (для локальной базы данных это обычно 'localhost')
    user: 'admin_ecoignatevo', // имя пользователя базы данных
    password: 'hfEqeWmoMLhFvQY0bqxY', // пароль пользователя базы данных
    database: 'admin_ecoignatevo', // имя базы данных
    port: 3306 // порт базы данных (по умолчанию 3306 для MySQL)
});
const dsn = {
    host:     'localhost',
    user:     'admin_ecoignatevo',
    password: 'hfEqeWmoMLhFvQY0bqxY',
};

const mysqlEventWatcher = MySQLEvents(dsn);

// Подключаемся к базе данных MySQL

const watcher =mysqlEventWatcher.add(
    'myDB.table.field.value',
    function (oldRow, newRow, event) {
        //row inserted
        if (oldRow === null) {
            client.leads.add({
                name: newRow.guest_count,
                custom_fields: {
                    'room_id': newRow.room_id,
                    'client_id': newRow.client_id,
                    'notes': newRow.notes,
                    'begin': newRow.begin,
                    'end': newRow.end,
                    'user_id': newRow.user_id,
                    'created_at': newRow.created_at,
                    'updated_at': newRow.updated_at,
                    'booking_status_id': newRow.booking_status_id,
                    'deleted_at': newRow.deleted_at,
                    'group_id': newRow.group_id,
                    'bed_id': newRow.bed_id,
                    'sum_prepaid': newRow.sum_prepaid,
                    'sum_full': newRow.sum_full,
                    'percent_off': newRow.percent_off,
                    'guest_count': newRow.guest_count,
                    'parent_id': newRow.parent_id,
                    'sale_channel_id': newRow.sale_channel_id,
                    'tariff_id': newRow.tariff_id,
                    'expired_at': newRow.expired_at,
                } })
        }

        //row deleted
        if (newRow === null) {
            //delete code goes here
        }

        //row updated
        if (oldRow !== null && newRow !== null) {
            //update code goes here
        }

        //detailed event information
        //console.log(event)
    },
    'match this string or regex'
);
// connection.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log('Connected to the database!');
//
//     // Начинаем прослушивание событий
//     event.start(connection, (err) => {
//         if (err) throw err;
//         console.log('Listening for events...');
//     });
//
//     // Обрабатываем событие insert
//     event.on('insert', (data) => {
//         const row = data.rows[0];
//         console.log(`New booking added: ${JSON.stringify(row)}`);
//
//         // Создаем новую сделку в AmoCRM
//         client.leads.add({
//             name: row.guest_count,
//             custom_fields: {
//                 'room_id': row.room_id,
//                 'client_id': row.client_id,
//                 'notes': row.notes,
//                 'begin': row.begin,
//                 'end': row.end,
//                 'user_id': row.user_id,
//                 'created_at': row.created_at,
//                 'updated_at': row.updated_at,
//                 'booking_status_id': row.booking_status_id,
//                 'deleted_at': row.deleted_at,
//                 'group_id': row.group_id,
//                 'bed_id': row.bed_id,
//                 'sum_prepaid': row.sum_prepaid,
//                 'sum_full': row.sum_full,
//                 'percent_off': row.percent_off,
//                 'guest_count': row.guest_count,
//                 'parent_id': row.parent_id,
//                 'sale_channel_id': row.sale_channel_id,
//                 'tariff_id': row.tariff_id,
//                 'expired_at': row.expired_at,
//             },
//         }).then((lead) => {
//             console.log(`New lead added: ${lead.id}`);
//         }).catch((error) => {
//             console.error(error);
//         });
//     });
// });



// app.get('/leads', async (req, res) => {
//     try {
//         const pagination = await client.leads.get();
//         console.log(pagination)
//         const leads = pagination.getData().map(lead => ({
//             id: lead.id,
//             name: lead.name,
//             // add other properties that you need
//         }));
//         res.json(leads);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });


const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




