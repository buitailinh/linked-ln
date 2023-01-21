import { FeedPostEntity } from './entities/feed.entity';
import { User } from './../auth/models/user.class';
import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedPost } from './dto/feed.interface';
const httpMocks = require('node-mocks-http');


describe('FeedService', () => {
  let feedService: FeedService;
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

  const mockFeedPostReqository = {
    createPost: jest.fn().mockImplementation((user: User, feedPost: FeedPost) => {
      return {
        ...feedPost,
        author: user
      }
    }),

    save: jest.fn().mockImplementation((feedPost: FeedPost) => {
      Promise.resolve({
        id: 1,
        ...feedPost
      })
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedService,
        {
          provide: getRepositoryToken(FeedPostEntity),
          useValue: mockFeedPostReqository
        }],
    }).compile();

    feedService = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(feedService).toBeDefined();
  });

  it('should create a feed post', (done: jest.DoneCallback) => {
    feedService
      .createPost(mockRequest.user, mockFeedPost)
      .subscribe((feedPost: FeedPost) => {
        expect(feedPost).toEqual({
          id: expect.any(Number),
          ...mockFeedPost,
        });
        done();
      });
  });
});
