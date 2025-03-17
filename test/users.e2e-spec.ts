import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Users Module (E2E)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let testUserId: number;

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
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await userRepository.save({
      username: 'testuser',
      password: hashedPassword,
    });

    // ✅ Ensure we correctly retrieve and store the user ID
    testUserId = user?.id;

    // Authenticate to get a valid JWT token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    authToken = response.body.access_token;

    // ✅ Log values to confirm they are set correctly
    console.log('Test User ID:', testUserId);
    console.log('Auth Token:', authToken);
  });

  afterAll(async () => {
    await app.close();
  });

  // ✅ Test 1: Unauthorized request should fail
  it('should NOT allow access to /users without a token', async () => {
    const response = await request(app.getHttpServer()).get('/users');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  // ✅ Test 2: Authorized request should succeed
  it('should allow access to /users with a valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Expecting a list of users
  });

  // ✅ Test 3: Fetching a single user should work
  it('should retrieve a specific user by ID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', testUserId);
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  // ✅ Test 4: Updating a user should work
  it('should allow updating user details', async () => {
    const updateResponse = await request(app.getHttpServer())
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'updatedUser' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('username', 'updatedUser');
  });

  // ✅ Test 5: Deleting a user should work
  it('should allow deleting a user', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteResponse.status).toBe(200);

    // Verify user no longer exists
    const findResponse = await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(findResponse.status).toBe(404);
  });
});
