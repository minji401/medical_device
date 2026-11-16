process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;
delete process.env.SHARED_DATABASE_URL;
process.env.SESSION_SECRET = "test-session-secret";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.TOSS_CLIENT_KEY = "test_ck_dummy";
process.env.TOSS_SECRET_KEY = "test_sk_dummy";
process.env.DEBUG = "False";
