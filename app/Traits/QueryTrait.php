<?php
namespace App\Traits;

trait QueryTrait {
    public function scopeCondition($query, $condition){
        if(isset($condition) && is_array($condition) && count($condition)){
            foreach($condition as $key => $val){
                if($val !== 0 && !empty($val) ){
                    $query->where($key, $val);
                }
            }
        }
        return $query;
    }
}
