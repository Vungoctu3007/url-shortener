<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->index();
            $table->string('slug')->nullable()->unique();
            $table->timestamp('expires_at')->nullable();
            $table->string('target');
            $table->string('qr_url')->nullable();
            $table->unsignedBigInteger('clicks')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
