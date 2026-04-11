# Звіт з лабораторної роботи №2

**Тема:** Docker та тестування. Шарова архітектура та Dependency Injection.  
**Студенти:** Пучков Денис, Кава Едвард, Михайлов Владислав ІМ-41.

---

## 1. Мета роботи

Навчитися використовувати Docker для контейнеризації застосунків, виконувати базове unit- та integration-тестування, впровадити патерн Dependency Injection (DI) та Data Transfer Objects (DTO), а також підключити реальну реляційну базу даних.

## 2. Короткий опис обраної предметної області

Обрана предметна область — **Система управління задачами (Task Manager)**.
Застосунок дозволяє користувачам реєструватися, авторизуватися та керувати своїми задачами.

Кожна задача має:

- Заголовок та опис
- Дедлайн виконання
- Статус (`PENDING`, `IN_PROGRESS`, `COMPLETED`)

Система забезпечує ізоляцію даних: кожен користувач бачить і може змінювати виключно власні задачі.

## 3. Що було реалізовано в роботі

- **База даних:** Підключено PostgreSQL з використанням ORM Prisma для надійного збереження даних.
- **Архітектура:** Реалізовано патерн **Dependency Injection**. Логіка чітко розділена на Контролери, Сервіси та Репозиторії.
- **DTO:** Додано Data Transfer Objects для фільтрації даних перед відправкою клієнту (наприклад, приховування хешу пароля користувача).
- **Фронтенд:** Створено базовий клієнт (HTML/CSS/JS) для зручної взаємодії з API.
- **Docker:** Застосунок повністю контейнеризовано. Налаштовано запуск Backend, Frontend та Database через єдиний файл `docker-compose.yml`.
- **Тестування:** Написано Unit-тести для сервісного шару (із використанням моків) та Інтеграційні тести для перевірки API з реальною тестовою БД.

## 4. Структура проєкту та схема залежностей

### Дерево проєкту

```text
project-root/
├── public/                 # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── app.js
│   └── Dockerfile          # Docker-образ для веб-клієнта (Nginx)
├── src/                    # Backend
│   ├── controllers/        # Обробка HTTP-запитів
│   ├── dto/                # Data Transfer Objects
│   ├── lib/                # Підключення Prisma клієнта
│   ├── middleware/         # JWT авторизація
│   ├── repositories/       # Робота з БД (Prisma)
│   ├── routes/             # Маршрутизація
│   ├── services/           # Бізнес-логіка
│   ├── app.js              # Налаштування Express
│   └── index.js            # Точка входу
├── tests/
│   ├── integration/        # Тести API (Supertest)
│   └── unit/               # Тести логіки (Jest)
├── prisma/
│   └── schema.prisma       # Схема БД
├── docker-compose.yml      # Оркестрація контейнерів
└── Dockerfile              # Docker-образ для Node.js (Backend)
```

### Схема залежностей (Dependency Injection)

`Route` ➔ `Controller` ➔ `Service` ➔ `Repository` ➔ `Prisma Client` ➔ `PostgreSQL`

Залежності передаються через конструктори класів. Наприклад, `TaskController` отримує екземпляр `TaskService`, а той, у свою чергу, отримує `TaskRepository`.

## 5. Архітектура, Docker та База Даних

### Архітектура застосунку

Застосунок побудовано за **шаровою архітектурою (Layered Architecture)**:

1. **Presentation Layer (Routes & Controllers):** Приймають HTTP-запити, передають дані в сервіси, загортають результат у DTO та повертають клієнту.
2. **Business Logic Layer (Services):** Містять усі правила предметної області (валідація дат, перевірка унікальності email, хешування паролів).
3. **Data Access Layer (Repositories):** Ізолюють сервіси від прямої роботи з ORM. Виконують CRUD операції.

### Docker-конфігурація

Проєкт розгортається через `docker-compose.yml`, який описує три сервіси в єдиній мережі `task_network`:

- **`db`:** Образ `postgres:15-alpine`. Дані зберігаються у підключеному volume `pgdata`.
- **`backend`:** Збирається з локального `Dockerfile` (Node.js). Запускає міграції БД перед стартом сервера.
- **`frontend`:** Збирається з `Dockerfile` у папці `public` (використовує `nginx:alpine` для роздачі статики).

### Структура Бази Даних

- **`User`:** `id` (Int, PK), `email` (String, Unique), `passwordHash` (String), `createdAt`.
- **`Task`:** `id` (Int, PK), `title` (String), `description` (String?), `status` (Enum), `dueDate` (DateTime?), `userId` (Int, FK), `createdAt`.

## 6. Приклади тестів

### Unit-тест (ізольоване тестування логіки)

Перевірка валідації при створенні задачі (з використанням моків репозиторію):

```javascript
test("Should throw error if dueDate is in the past", async () => {
  const pastDate = new Date("2000-01-01").toISOString();
  await expect(
    taskService.createTask("Title", "desc", pastDate, 1),
  ).rejects.toThrow("Due date cannot be in the past");
});
```

### Integration-тест (перевірка з БД та HTTP)

Перевірка створення задачі через API:

```javascript
test("POST /tasks should create task in database", async () => {
  const res = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Integration Task", description: "DB Check" });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("id");

  // Перевірка безпосередньо в базі даних
  const taskInDb = await prisma.task.findUnique({
    where: { id: res.body.id },
  });
  expect(taskInDb.title).toBe("Integration Task");
});
```

## 7. Висновки

У ході виконання лабораторної роботи:

1. Впровадження **Dependency Injection** зробило код гнучкішим та дозволило легко писати ізольовані Unit-тести.
2. Використання **DTO** підвищило безпеку API, унеможлививши випадковий витік чутливих даних (наприклад, паролів).
3. **Контейнеризація за допомогою Docker** забезпечила консистентне середовище, яке розгортається однією командою та працює однаково на будь-якому комп'ютері.
4. Наявність **Інтеграційних тестів** гарантує, що всі компоненти системи взаємодіють коректно на рівні бази даних та мережі.
