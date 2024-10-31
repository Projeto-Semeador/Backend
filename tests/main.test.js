const request = require("supertest");
const app = require("../main");

const users = [];

const mockUser = {
  user: {
    username: "testuser",
    password: "password",
  },
};

var tokens = [];

describe("POST /register", () => {
  it("should register a user", async () => {
    return await request(app).post("/register").send(mockUser).expect(201).then((response) => {
      users.push(response.body.user);
    });
  });

  it("should return bad request", async () => {
    return await request(app).post("/register").send({ user: { username: "testuser" } }).expect(400);
  });
})

describe("POST /login", () => {
  it("should login a user", async () => {
    return await request(app).post("/login").send(mockUser).expect(200);
  });

  it("should return unauthorized", async () => {
    return await request(app).post("/login").send({ user: { username: "testuser", password: "wrongpassword" } }).expect(401);
  });
})

describe("POST /recover", () => {
  it("should create a recovery token", async () => {
    return await request(app).post("/recover").send(mockUser).expect(201).then((response) => {
      tokens.push(response.body.token);
    });
  });
});

describe("GET /recover/:token", () => {
  it("should return token valid", async () => {
    return await request(app).get(`/recover/${tokens[0]}`).expect(200);
  });

  it("should return token not found or expired", async () => {
    return await request(app).get("/recover/invalidtoken").expect(400);
  });
});