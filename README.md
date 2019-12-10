# hello-prisma
- 전통적인 ORM과 간단한 DB 작업의 대체물
	- client 자동 생성
	- data migration.
	- 관리툴
- MySQL, PostgreSQL, MongoDB 지원.
- Client -> Application / API Server -> Data Access Layer (Prisma) -> Database

1. Prisma CLI 설치
> npm install -g prisma

2. Project directory 생성
> mkdir hello-world
> cd hello-world

3. Docker Compose file 생성
> touch docker-compose.yme
```
version: '3'
services:
  prisma:
    image: prismagraphql/prisma:1.34
    restart: always
    ports:
      - '4466:4466'
    environment:
      PRISMA_CONFIG: |
        port: 4466
        databases:
          default:
            connector: postgres
            host: postgres
            port: 5432
            user: prisma
            password: prisma
  postgres:
    image: postgres:10.3
    restart: always
    environment:
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
    volumes:
      - postgres:/var/lib/postgresql/data
volumes:
  postgres: ~
```
4. Prisma 실행
> docker-compose up -d
- http:/localhost:4466 으로 prisma server 기동

5. Prisma API endpoint 설정
> prisma init --endpoint http://localhost:4466
- datamodel.prisma 와 prisma.yml 생성됨

6. Prisma datamodel 을 배포함.
> prisma deploy
- datamodel.prisma에 정의된 User Model이 생성됨.
- http://localhost:4466/_admin 접속

7. Prisma client를 생성함
- prisma.yml 수정
```
generate:
  - generator: javascript-client
    output: ./generated/prisma-client/
```
> prisma generate

8. Node application 준비
> touch index.js
> npm init -y
> npm install --save prisma-client-lib

9. index.js 작업
```
const { prisma } = require('./generated/prisma-client')

// A `main` function so that we can use async/await
async function main() {
  // Create a new user called `Alice`
  const newUser = await prisma.createUser({ name: 'Alice' })
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`)

  // Read all users from the database and print them to the console
  const allUsers = await prisma.users()
  console.log(allUsers)
}

main().catch(e => console.error(e))
```
> node index.js

20. 다른 api 테스트
> touch find.js
```
const { prisma } = require('./generated/prisma-client');

async function main() {
	const user = await prisma.user({id:'ck3zg5j5d005l0837rujpsb3y'});
	console.log(user);

	const updateUser = await prisma.updateUser({
		where: {id:'ck3zg5j5d005l0837rujpsb3y'},
		data: { name: 'Bob'}
	});
	console.log(updateUser);

	const another = await prisma.users({
		where: {name: 'Bob'}
	});
	console.log(another);
};

main().catch(console.error);
```
> node find.js

21. model 변경 (datamode.prisma)
```
type User {
  id: ID! @id
  email: String @unique
  name: String!
  posts: [Post!]!
}

type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User @relation(link: INLINE)
}
```
> prisma deploy
> prisma generate
* data가 삭제되지 않네요.

22. 자동 generate (prisma.yml 수정)
```
hooks:
	post-deploy:
		- prisma generate
```

23. createNewUser.js 작성
```
const { prisma } = require('./generated/prisma-client')

// A `main` function so that we can use async/await
async function main() {
  // Create a new user with a new post
  const newUser = await prisma.createUser({
    name: 'Bob',
    email: 'bob@prisma.io',
    posts: {
      create: [
        {
          title: 'Join us for GraphQL Conf in 2019',
        },
        {
          title: 'Subscribe to GraphQL Weekly for GraphQL news',
        },
      ],
    },
  })
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`)

  // Read all users from the database and print them to the console
  const allUsers = await prisma.users()
  console.log(allUsers)

  const allPosts = await prisma.posts()
  console.log(allPosts)
}

main().catch(e => console.error(e))
```
> node createNewUser.js

24. 관계 쿼리 (find.js 수정)
```
	const postsByUser = await prisma.user({email: 'bob@test.com'}).posts();
	console.log(`All posts by that user:${JSON.stringfy(postsByUser)}`);
```
> node find.js