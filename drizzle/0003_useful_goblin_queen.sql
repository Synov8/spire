CREATE TABLE "access_relationship" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"identity_name" text NOT NULL,
	"identity_type" text NOT NULL,
	"asset_id" text NOT NULL,
	"access_level" text NOT NULL,
	"source" text NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"last_verified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"provider" text,
	"provider_id" text,
	"metadata" jsonb,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_flow" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"source_asset_id" text NOT NULL,
	"target_asset_id" text,
	"data_type" text NOT NULL,
	"direction" text DEFAULT 'internal' NOT NULL,
	"description" text,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy" (
	"id" text PRIMARY KEY NOT NULL,
	"framework" text NOT NULL,
	"policy_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text DEFAULT 'high' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policy_policy_id_unique" UNIQUE("policy_id")
);
--> statement-breakpoint
CREATE TABLE "policy_check" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"asset_id" text,
	"status" text NOT NULL,
	"detail" text,
	"evidence" jsonb,
	"last_checked_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"rule_type" text NOT NULL,
	"config" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_relationship" ADD CONSTRAINT "access_relationship_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_relationship" ADD CONSTRAINT "access_relationship_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_flow" ADD CONSTRAINT "data_flow_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_flow" ADD CONSTRAINT "data_flow_source_asset_id_asset_id_fk" FOREIGN KEY ("source_asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_flow" ADD CONSTRAINT "data_flow_target_asset_id_asset_id_fk" FOREIGN KEY ("target_asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_check" ADD CONSTRAINT "policy_check_rule_id_policy_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."policy_rule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_check" ADD CONSTRAINT "policy_check_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_check" ADD CONSTRAINT "policy_check_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_rule" ADD CONSTRAINT "policy_rule_policy_id_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("id") ON DELETE cascade ON UPDATE no action;