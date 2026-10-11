import { pgTable, serial, text, integer, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users / Admins
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('editor'), // 'admin' | 'editor' | 'viewer'
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role),
]);

// 2. Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('category_slug_idx').on(table.slug),
]);

// 3. Topics (Entities separate from articles and keywords)
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sanskritName: text('sanskrit_name'),
  entityType: text('entity_type').notNull().default('concept'), // 'deity', 'concept', 'shastra', 'energy_zone', 'ritual', 'direction'
  summary: text('summary').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('topic_slug_idx').on(table.slug),
  index('topic_entity_type_idx').on(table.entityType),
]);

// 4. Topic Relations (Topic <-> Topic)
export const topicRelations = pgTable('topic_relations', {
  id: serial('id').primaryKey(),
  sourceTopicId: integer('source_topic_id').references(() => topics.id, { onDelete: 'cascade' }).notNull(),
  targetTopicId: integer('target_topic_id').references(() => topics.id, { onDelete: 'cascade' }).notNull(),
  relationType: text('relation_type').notNull().default('related_to'), // 'presides_over', 'associated_with', 'counterpart_of', 'vedic_root'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('topic_rel_source_idx').on(table.sourceTopicId),
  index('topic_rel_target_idx').on(table.targetTopicId),
]);

// 5. Keywords
export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('keyword_slug_idx').on(table.slug),
]);

// 6. Articles
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('draft'), // 'draft' | 'review' | 'published' | 'archived'
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  readingTimeMinutes: integer('reading_time_minutes').default(5).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('article_slug_idx').on(table.slug),
  index('article_status_idx').on(table.status),
  index('article_category_idx').on(table.categoryId),
  index('article_published_at_idx').on(table.publishedAt),
]);

// 7. Article Topics (M:N Article <-> Topic)
export const articleTopics = pgTable('article_topics', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'cascade' }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
}, (table) => [
  index('article_topics_article_idx').on(table.articleId),
  index('article_topics_topic_idx').on(table.topicId),
]);

// 8. Article Keywords (M:N Article <-> Keyword)
export const articleKeywords = pgTable('article_keywords', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  keywordId: integer('keyword_id').references(() => keywords.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  index('article_keywords_article_idx').on(table.articleId),
  index('article_keywords_keyword_idx').on(table.keywordId),
]);

// 9. Advertisements
export const advertisements = pgTable('advertisements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  destinationUrl: text('destination_url').notNull(),
  placement: text('placement').notNull(), // 'HEADER' | 'ARTICLE_TOP' | 'ARTICLE_MIDDLE' | 'ARTICLE_BOTTOM' | 'SIDEBAR' | 'FOOTER' | 'STICKY_FOOTER' | 'MOBILE'
  adType: text('ad_type').default('BANNER').notNull(), // 'BANNER' | 'ADSENSE' | 'CUSTOM_HTML'
  adSenseSlot: text('adsense_slot'), // Google AdSense data-ad-slot ID
  adSenseFormat: text('adsense_format').default('auto'), // 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  customHtml: text('custom_html'), // Raw embed or affiliate code snippet
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(1).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ad_placement_active_idx').on(table.placement, table.isActive),
]);

// 10. Ad Impressions
export const adImpressions = pgTable('ad_impressions', {
  id: serial('id').primaryKey(),
  advertisementId: integer('advertisement_id').references(() => advertisements.id, { onDelete: 'cascade' }).notNull(),
  placement: text('placement').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ad_imp_advertisement_idx').on(table.advertisementId),
  index('ad_imp_created_at_idx').on(table.createdAt),
]);

// 11. Ad Clicks
export const adClicks = pgTable('ad_clicks', {
  id: serial('id').primaryKey(),
  advertisementId: integer('advertisement_id').references(() => advertisements.id, { onDelete: 'cascade' }).notNull(),
  placement: text('placement').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ad_clicks_advertisement_idx').on(table.advertisementId),
]);

// 12. Media Library
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  altText: text('alt_text'),
  uploadedById: integer('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'CREATE_ARTICLE', 'UPDATE_ARTICLE', etc.
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_created_at_idx').on(table.createdAt),
]);

// 14. Redirects
export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  sourcePath: text('source_path').notNull().unique(),
  targetPath: text('target_path').notNull(),
  statusCode: integer('status_code').default(301).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Site / Admin Contact Settings
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  primaryPhone: text('primary_phone').notNull().default('+91 98200 18272'),
  secondaryPhone: text('secondary_phone').default('+91 98200 45678'),
  primaryEmail: text('primary_email').notNull().default('contact@vasturitam.com'),
  consultationEmail: text('consultation_email').default('consultation@vasturitam.com'),
  whatsappNumber: text('whatsapp_number').default('+919820018272'),
  whatsappNotice: text('whatsapp_notice').default('✦ WhatsApp Available for Blueprint Sharing'),
  consultationTimings: text('consultation_timings').default('Monday – Saturday: 10:00 AM – 6:30 PM (IST)'),
  appointmentNotice: text('appointment_notice').default('Prior appointment required for in-depth architectural floor plan audit.'),
  youtubeUrl: text('youtube_url'),
  youtubeHandle: text('youtube_handle'),
  twitterUrl: text('twitter_url'),
  twitterHandle: text('twitter_handle'),
  facebookUrl: text('facebook_url'),
  facebookHandle: text('facebook_handle'),
  instagramUrl: text('instagram_url'),
  instagramHandle: text('instagram_handle'),
  officeAddress: text('office_address'),
  collaborationNotice: text('collaboration_notice'),
  logoUrl: text('logo_url').default('/trademark-logo.jpg'),
  adsensePublisherId: text('adsense_publisher_id').default('ca-pub-9697854430800000'),
  adsenseEnabled: boolean('adsense_enabled').default(true),
  adsenseAutoAds: boolean('adsense_auto_ads').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  media: many(media),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  articleTopics: many(articleTopics),
  outgoingRelations: many(topicRelations, { relationName: 'outgoing' }),
  incomingRelations: many(topicRelations, { relationName: 'incoming' }),
}));

export const topicRelationsRelations = relations(topicRelations, ({ one }) => ({
  sourceTopic: one(topics, {
    fields: [topicRelations.sourceTopicId],
    references: [topics.id],
    relationName: 'outgoing',
  }),
  targetTopic: one(topics, {
    fields: [topicRelations.targetTopicId],
    references: [topics.id],
    relationName: 'incoming',
  }),
}));

export const keywordsRelations = relations(keywords, ({ many }) => ({
  articleKeywords: many(articleKeywords),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  articleTopics: many(articleTopics),
  articleKeywords: many(articleKeywords),
}));

export const articleTopicsRelations = relations(articleTopics, ({ one }) => ({
  article: one(articles, {
    fields: [articleTopics.articleId],
    references: [articles.id],
  }),
  topic: one(topics, {
    fields: [articleTopics.topicId],
    references: [topics.id],
  }),
}));

export const articleKeywordsRelations = relations(articleKeywords, ({ one }) => ({
  article: one(articles, {
    fields: [articleKeywords.articleId],
    references: [articles.id],
  }),
  keyword: one(keywords, {
    fields: [articleKeywords.keywordId],
    references: [keywords.id],
  }),
}));

export const advertisementsRelations = relations(advertisements, ({ many }) => ({
  impressions: many(adImpressions),
  clicks: many(adClicks),
}));

// 16. Video Learning (Gyan Kosh Video Learning Management)
// Strictly stores external video reference metadata (YouTube/Vimeo).
// No actual video file is ever uploaded, stored, or processed on the server.
export const videoLearning = pgTable('video_learning', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  videoUrl: text('video_url').notNull(),
  videoProvider: text('video_provider').notNull(), // 'youtube' | 'vimeo'
  thumbnailUrl: text('thumbnail_url').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('draft'), // 'draft' | 'published' | 'unpublished'
  displayOrder: integer('display_order').default(0).notNull(),
  duration: text('duration'), // e.g. '28:40'
  instructor: text('instructor'), // e.g. 'Vastu Ritam Fellowship'
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('video_learning_slug_idx').on(table.slug),
  index('video_learning_status_idx').on(table.status),
  index('video_learning_category_idx').on(table.categoryId),
  index('video_learning_topic_idx').on(table.topicId),
  index('video_learning_order_idx').on(table.displayOrder),
]);

export const videoLearningRelations = relations(videoLearning, ({ one }) => ({
  category: one(categories, {
    fields: [videoLearning.categoryId],
    references: [categories.id],
  }),
  topic: one(topics, {
    fields: [videoLearning.topicId],
    references: [topics.id],
  }),
  author: one(users, {
    fields: [videoLearning.createdBy],
    references: [users.id],
  }),
}));

// 17. Handbooks (Gyan Kosh Handbooks & Field Guides Management)
// Protected PDFs are stored privately on server disk, requiring verified contact details or admin session to access.
export const handbooks = pgTable('handbooks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  subtitle: text('subtitle'),
  targetAudience: text('target_audience').notNull().default('Architects & Homeowners'),
  pages: integer('pages').default(40).notNull(),
  topics: text('topics').default('[]').notNull(), // JSON array of topic strings
  summary: text('summary').notNull(),
  pdfFileName: text('pdf_file_name'),
  pdfFilePath: text('pdf_file_path'),
  pdfFileSizeBytes: integer('pdf_file_size_bytes'),
  isPublished: boolean('is_published').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('handbooks_slug_idx').on(table.slug),
  index('handbooks_published_idx').on(table.isPublished),
  index('handbooks_display_order_idx').on(table.displayOrder),
]);

// 18. Handbook Access Leads (Secure storage of verified client contacts who requested reading access)
export const handbookLeads = pgTable('handbook_leads', {
  id: serial('id').primaryKey(),
  handbookId: text('handbook_id').notNull(),
  handbookTitle: text('handbook_title').notNull(),
  fullName: text('full_name'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  accessToken: text('access_token'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('handbook_leads_email_idx').on(table.email),
  index('handbook_leads_phone_idx').on(table.phone),
  index('handbook_leads_handbook_idx').on(table.handbookId),
  index('handbook_leads_created_at_idx').on(table.createdAt),
]);

