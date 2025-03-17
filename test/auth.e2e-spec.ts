import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

//here Tests authentication (login, JWT generation, failures).
describe('Auth Module (E2E)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Inject User Repository
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // Clear Users Table and Create Test User
    await userRepository.clear();

    const hashedPassword = await bcrypt.hash('testpassword', 10); // ✅ Ensure hashing before saving
    await userRepository.save({
      username: 'testuser',
      password: hashedPassword, // ✅ Store hashed password
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login successfully and return a JWT token without role', async () => {
    // 🔹 Arrange: User login credentials
    const loginDto = { username: 'testuser', password: 'testpassword' };

    // 🔹 Act: Send login request
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // 🔹 Assert: Expect a valid response with JWT token
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');

    // Decode JWT Token
    const decoded = jwt.decode(response.body.access_token);
    expect(decoded).toHaveProperty('username');
    expect(decoded).toHaveProperty('sub'); // user ID
    expect(decoded).not.toHaveProperty('role'); // ✅ Ensure role is NOT present
  });

  it('should fail login with incorrect password', async () => {
    // 🔹 Arrange: Incorrect password
    const loginDto = { username: 'testuser', password: 'wrongpassword' };

    // 🔹 Act: Send login request
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // 🔹 Assert: Expect unauthorized response
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should fail login with non-existing user', async () => {
    // 🔹 Arrange: Non-existing user
    const loginDto = { username: 'unknownuser', password: 'password123' };

    // 🔹 Act: Send login request
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // 🔹 Assert: Expect not found response
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
