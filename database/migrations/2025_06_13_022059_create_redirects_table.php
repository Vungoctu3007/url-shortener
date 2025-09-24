<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->constrained()->onDelete('cascade');
            $table->index(['link_id']);
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referrer')->nullable();

            $table->string('country', 100)->nullable();
            $table->string('device', 50)->nullable();
            $table->string('browser', 50)->nullable();

            $table->timestamps();

            $table->index(['link_id', 'created_at']);
            $table->index('created_at');
            $table->index('country');
            $table->index('device');
            $table->index('browser');
            $table->index('referrer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redirects');
    }
};
