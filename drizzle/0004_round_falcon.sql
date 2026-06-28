CREATE TABLE "manual_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_check_id" text,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"file_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "policy_check" ADD COLUMN "needs_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "manual_evidence" ADD CONSTRAINT "manual_evidence_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_evidence" ADD CONSTRAINT "manual_evidence_policy_check_id_policy_check_id_fk" FOREIGN KEY ("policy_check_id") REFERENCES "public"."policy_check"("id") ON DELETE set null ON UPDATE no action;