ALTER TABLE "manual_evidence" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "manual_evidence" ADD COLUMN "original_filename" text;--> statement-breakpoint
ALTER TABLE "policy_check" DROP COLUMN "needs_review";