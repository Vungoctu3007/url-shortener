<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'target' => 'required|url|max:2048',
            'title' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:50|regex:/^[a-z0-9\-_]+$/|unique:links,slug',
            'expires_at' => 'nullable|date|after:now',
            'user_id' => 'required|integer|exists:users,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'target.required' => 'The target URL is required.',
            'target.url' => 'The target must be a valid URL.',
            'target.max' => 'The target URL cannot exceed 2048 characters.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'slug.max' => 'The custom slug cannot exceed 50 characters.',
            'slug.regex' => 'The custom slug can only contain lowercase letters, numbers, hyphens, and underscores.',
            'slug.unique' => 'This custom slug is already taken. Please choose another one.',
            'expires_at.date' => 'The expiration date must be a valid date.',
            'expires_at.after' => 'The expiration date must be in the future.',
            'user_id.required' => 'User ID is required.',
            'user_id.exists' => 'The specified user does not exist.'
        ];
    }
}
