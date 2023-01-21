import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthService } from './../auth/services/auth.service';
import { JwtGuard } from './../auth/guards/jwt.guard';
import { UserService } from './../auth/services/user.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { Test, TestingModule } from '@nestjs/testing';
const httpMocks = require('node-mocks-http');
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { User } from './../auth/models/user.class';
import { FeedPost } from './dto/feed.interface';

describe('FeedController', () => {
  let feedcontroller: FeedController;
  let feedservice: FeedService;
  let userService: UserService;
  let authService: AuthService;

  const mockRequest = httpMocks.createRequest();
  mockRequest.user = new User();
  mockRequest.user.id = expect.any(Number);
  mockRequest.user.firstName = 'bui';
  mockRequest.user.lastName = 'linh';
  mockRequest.user.email = 'a@gmail.com';
  mockRequest.user.password = 'acb';

  const mockFeedPost: FeedPost = {
    body: 'body',
    createdAt: new Date(),
    author: mockRequest.user
  }

  const mockFeedPosts: FeedPost[] = [
    mockFeedPost,
    { ...mockFeedPost, body: 'second feed post' },
    { ...mockFeedPost, body: 'third feed post' },
  ];

  const mockDeleteResult: DeleteResult = {
    raw: [],
    affected: 1,
  };
  const mockUpdateResult: UpdateResult = {
    ...mockDeleteResult,
    generatedMaps: [],
  }

  const mockFeedService = {
    createPost: jest.fn().mockImplementation((user: User, feedPost: FeedPost) => {
      return {
        id: 1,
        ...feedPost,
      };
    }),
    findPosts: jest.fn().mockImplementation((numberToTake: number, numberToSkip: number) => {
      const feedPostsAfterSkipping = mockFeedPosts.slice(numberToSkip);
      const filteredFeedPosts = feedPostsAfterSkipping.slice(0, numberToTake);
      return filteredFeedPosts;
    }),
    updatePost: jest.fn().mockImplementation(() => {
      return mockUpdateResult;
    }),
    deletePost: jest.fn().mockImplementation(() => {
      return mockDeleteResult;
    })
  };
  const mockUserService = {};
  const mockAuthService = {};

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [FeedService,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtGuard, useValue: jest.fn().mockImplementation(() => true) },
        { provide: IsCreatorGuard, useValue: jest.fn().mockImplementation(() => true) },
      ],
    }).overrideProvider(FeedService).useValue(mockFeedService)
      .compile();

    feedservice = moduleRef.get<FeedService>(FeedService);
    userService = moduleRef.get<UserService>(UserService);
    authService = moduleRef.get<AuthService>(AuthService);
    feedcontroller = moduleRef.get<FeedController>(FeedController);
  });



  it('should be defined', () => {
    expect(feedcontroller).toBeDefined();
  });

  it('should create a feed post', () => {
    expect(feedcontroller.create(mockFeedPost, mockRequest)).toEqual(

      mockRequest.user

    );
  });

  it('should get 2 feed posts, skipping the first ', () => {
    expect(feedcontroller.findSelected(2, 1)).toEqual(
      mockFeedPosts.slice(1)
    );
  });

  it('should update a feed post', () => {
    expect(feedcontroller.updatePost({ ...mockFeedPost, body: 'update body' }, 1)).toEqual(
      mockUpdateResult
    )
  }
  );

  it('should delete a feed post ', () => {
    expect(feedcontroller.deletePost(1)).toEqual(
      mockDeleteResult
    );
  });
});
